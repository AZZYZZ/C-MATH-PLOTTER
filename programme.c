#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>
#include <errno.h>
#include <limits.h>
#include <stdarg.h>

#ifdef _WIN32
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <winsock2.h>
typedef SOCKET socket_t;
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/time.h>
#include <unistd.h>
typedef int socket_t;
#define INVALID_SOCKET (-1)
#define SOCKET_ERROR (-1)
#endif
#include <time.h>

#define DEFAULT_PORT 8080
#define RESPONSE_BUFFER_SIZE (2 * 1024 * 1024)
#define MAX_HTTP_REQUEST_SIZE 8192
#define MAX_EXPRESSION_LENGTH 255
#define MAX_PARSE_DEPTH 32
#define CLIENT_RECEIVE_TIMEOUT_SECONDS 2
#define CLIENT_SEND_TIMEOUT_SECONDS 5
#define CLIENT_REQUEST_TIMEOUT_SECONDS 5
#define PI_VAL 3.14159265358979323846
#define E_VAL  2.71828182845904523536
#define SECURITY_HEADERS \
    "X-Content-Type-Options: nosniff\r\n" \
    "X-Frame-Options: DENY\r\n" \
    "Referrer-Policy: strict-origin-when-cross-origin\r\n" \
    "Content-Security-Policy: default-src 'self'; script-src 'self'; " \
        "style-src 'self' 'unsafe-inline'; img-src 'self' data:; " \
        "connect-src 'self' http://localhost:8080 http://127.0.0.1:8080; " \
        "object-src 'none'; base-uri 'self'; form-action 'self'; " \
        "frame-ancestors 'none'\r\n"

// --- 1. PARSEUR MATHÉMATIQUE (Recursive Descent) ---
typedef struct {
    double x;
    double a;
    double b;
    int angle_degrees;
    unsigned *parse_depth;
} EvalContext;

double parse_expr(const char **p, const EvalContext *context);

static int enter_parse_depth(const EvalContext *context) {
    if (*context->parse_depth >= MAX_PARSE_DEPTH) return 0;
    (*context->parse_depth)++;
    return 1;
}

static void leave_parse_depth(const EvalContext *context) {
    (*context->parse_depth)--;
}

void skip_spaces(const char **p) {
    while (**p && isspace((unsigned char)**p)) (*p)++;
}

int starts_primary(const char **p) {
    skip_spaces(p);
    if (**p == '(' || **p == 'x' || **p == 'X' ||
        **p == 'n' || **p == 'N' || **p == 'u' || **p == 'U' ||
        **p == 'a' || **p == 'A' || **p == 'b' || **p == 'B' || **p == 'e' ||
        isdigit((unsigned char)**p)) return 1;
    if (**p == '.' && isdigit((unsigned char)(*p)[1])) return 1;
    return strncmp(*p, "sin", 3) == 0 || strncmp(*p, "cos", 3) == 0 ||
           strncmp(*p, "tan", 3) == 0 || strncmp(*p, "sqrt", 4) == 0 ||
           strncmp(*p, "abs", 3) == 0 || strncmp(*p, "exp", 3) == 0 ||
           strncmp(*p, "log", 3) == 0 || strncmp(*p, "ln", 2) == 0 ||
           strncmp(*p, "pi", 2) == 0;
}

double parse_primary(const char **p, const EvalContext *context) {
    skip_spaces(p);

    if (**p == '(') {
        (*p)++;
        if (!enter_parse_depth(context)) return NAN;
        double val = parse_expr(p, context);
        leave_parse_depth(context);
        skip_spaces(p);
        if (**p != ')') return NAN;
        (*p)++;
        return val;
    }

    if (strncmp(*p, "sin", 3) == 0) {
        *p += 3;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return sin(context->angle_degrees ? value * PI_VAL / 180.0 : value);
    }
    if (strncmp(*p, "cos", 3) == 0) {
        *p += 3;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return cos(context->angle_degrees ? value * PI_VAL / 180.0 : value);
    }
    if (strncmp(*p, "tan", 3) == 0) {
        *p += 3;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return tan(context->angle_degrees ? value * PI_VAL / 180.0 : value);
    }
    if (strncmp(*p, "sqrt", 4) == 0) {
        *p += 4;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return sqrt(value);
    }
    if (strncmp(*p, "abs", 3) == 0) {
        *p += 3;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return fabs(value);
    }
    if (strncmp(*p, "exp", 3) == 0) {
        *p += 3;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return exp(value);
    }
    if (strncmp(*p, "log", 3) == 0) {
        *p += 3;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return log10(value);
    }
    if (strncmp(*p, "ln", 2) == 0) {
        *p += 2;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_primary(p, context);
        leave_parse_depth(context);
        return log(value);
    }
    if (strncmp(*p, "pi", 2) == 0)   { *p += 2; return PI_VAL; }

    if (**p == 'x' || **p == 'X' || **p == 'n' || **p == 'N' ||
        **p == 'u' || **p == 'U') { (*p)++; return context->x; }
    if (**p == 'a' || **p == 'A') { (*p)++; return context->a; }
    if (**p == 'b' || **p == 'B') { (*p)++; return context->b; }
    if (**p == 'e')               { (*p)++; return E_VAL; }

    // Les nombres
    char *end;
    double val = strtod(*p, &end);
    if (end != *p) {
        *p = end;
        return val;
    }
    return NAN;
}

double parse_power(const char **p, const EvalContext *context);

double parse_unary(const char **p, const EvalContext *context) {
    skip_spaces(p);
    if (**p == '-' || **p == '+') {
        int negative = **p == '-';
        (*p)++;
        if (!enter_parse_depth(context)) return NAN;
        double value = parse_unary(p, context);
        leave_parse_depth(context);
        return negative ? -value : value;
    }
    return parse_power(p, context);
}

double parse_power(const char **p, const EvalContext *context) {
    double base = parse_primary(p, context);
    skip_spaces(p);
    if (**p == '^') {
        (*p)++;
        if (!enter_parse_depth(context)) return NAN;
        double exp_val = parse_unary(p, context);
        leave_parse_depth(context);
        return pow(base, exp_val);
    }
    return base;
}

double parse_term(const char **p, const EvalContext *context) {
    double val = parse_unary(p, context);
    while (1) {
        skip_spaces(p);
        if (**p == '*') { (*p)++; val *= parse_unary(p, context); }
        else if (**p == '/') { (*p)++; val /= parse_unary(p, context); }
        else if (starts_primary(p)) val *= parse_unary(p, context);
        else break;
    }
    return val;
}

double parse_expr(const char **p, const EvalContext *context) {
    double val = parse_term(p, context);
    while (1) {
        skip_spaces(p);
        if (**p == '+') { (*p)++; val += parse_term(p, context); }
        else if (**p == '-') { (*p)++; val -= parse_term(p, context); }
        else break;
    }
    return val;
}

double eval_function(const char *expr, double x, double a, double b, int angle_degrees) {
    const char *p = expr;
    unsigned parse_depth = 0;
    EvalContext context = { x, a, b, angle_degrees, &parse_depth };
    double result = parse_expr(&p, &context);
    skip_spaces(&p);
    return *p ? NAN : result;
}

double derivative_function(const char *expr, double x, double a, double b, int angle_degrees) {
    double h = 1e-5 * fmax(1.0, fabs(x));
    return (eval_function(expr, x + h, a, b, angle_degrees) -
            eval_function(expr, x - h, a, b, angle_degrees)) / (2.0 * h);
}

static double second_derivative_with_context(const char *expr, double x,
                                            double a, double b, int angle_degrees) {
    double h = 1e-4 * fmax(1.0, fabs(x));
    return (eval_function(expr, x + h, a, b, angle_degrees) -
            2.0 * eval_function(expr, x, a, b, angle_degrees) +
            eval_function(expr, x - h, a, b, angle_degrees)) / (h * h);
}

double second_derivative_function(const char *expr, double x) {
    return second_derivative_with_context(expr, x, 1.0, 1.0, 0);
}

double integrate_function(const char *expr, double xmin, double xmax,
                          double a, double b, int angle_degrees) {
    const int steps = 1000;
    double dx = (xmax - xmin) / steps;
    if (!isfinite(dx) || dx == 0.0) return NAN;
    double sum = eval_function(expr, xmin, a, b, angle_degrees) +
                 eval_function(expr, xmax, a, b, angle_degrees);

    if (!isfinite(sum)) return NAN;
    for (int i = 1; i < steps; i++) {
        double y = eval_function(expr, xmin + i * dx, a, b, angle_degrees);
        if (!isfinite(y)) return NAN;
        sum += (i % 2 ? 4.0 : 2.0) * y;
    }
    return sum * dx / 3.0;
}

// --- 2. OUTILS URL & HTTP ---
static int url_decode(const char *src, size_t src_len, char *dest, size_t max_len) {
    if (max_len == 0) return -1;
    size_t i = 0;
    size_t j = 0;
    while (j < src_len) {
        unsigned char value;
        if (src[j] == '%') {
            if (j + 2 >= src_len ||
                !isxdigit((unsigned char)src[j + 1]) ||
                !isxdigit((unsigned char)src[j + 2])) return -1;
            char hex[3] = { src[j + 1], src[j + 2], '\0' };
            value = (unsigned char)strtol(hex, NULL, 16);
            j += 3;
        } else if (src[j] == '+') {
            value = ' ';
            j++;
        } else {
            value = (unsigned char)src[j++];
        }
        if (value == '\0' || i + 1 >= max_len) return -1;
        dest[i++] = (char)value;
    }
    dest[i] = '\0';
    return 0;
}

static int get_param(const char *query, const char *key, char *out, size_t max_len) {
    if (max_len == 0) return -1;
    out[0] = '\0';
    size_t key_len = strlen(key);
    const char *pos = query;
    while (*pos) {
        while (*pos == '?' || *pos == '&') pos++;
        if (!*pos || *pos == ' ' || *pos == '\r' || *pos == '\n') break;
        const char *end = strpbrk(pos, "& \r\n");
        if (!end) end = pos + strlen(pos);
        const char *equals = memchr(pos, '=', (size_t)(end - pos));
        if (equals && (size_t)(equals - pos) == key_len &&
            memcmp(pos, key, key_len) == 0) {
            size_t len = (size_t)(end - equals - 1);
            return url_decode(equals + 1, len, out, max_len);
        }
        pos = *end ? end + 1 : end;
    }
    return 1;
}

static int parse_finite_number(const char *text, double fallback, double *value) {
    if (!text || !*text) {
        *value = fallback;
        return 0;
    }

    errno = 0;
    char *end = NULL;
    double parsed = strtod(text, &end);
    if (end == text || errno == ERANGE || !isfinite(parsed)) return -1;
    while (*end && isspace((unsigned char)*end)) end++;
    if (*end) return -1;
    *value = parsed;
    return 0;
}

static int parse_integer(const char *text, int fallback, int *value) {
    if (!text || !*text) {
        *value = fallback;
        return 0;
    }

    errno = 0;
    char *end = NULL;
    long parsed = strtol(text, &end, 10);
    if (end == text || errno == ERANGE || parsed < INT_MIN || parsed > INT_MAX) return -1;
    while (*end && isspace((unsigned char)*end)) end++;
    if (*end) return -1;
    *value = (int)parsed;
    return 0;
}

static void close_socket(socket_t socket_fd) {
#ifdef _WIN32
    closesocket(socket_fd);
#else
    close(socket_fd);
#endif
}

static int set_client_timeouts(socket_t socket_fd) {
#ifdef _WIN32
    DWORD receive_timeout_ms = CLIENT_RECEIVE_TIMEOUT_SECONDS * 1000;
    DWORD send_timeout_ms = CLIENT_SEND_TIMEOUT_SECONDS * 1000;
    if (setsockopt(socket_fd, SOL_SOCKET, SO_RCVTIMEO,
            (const char *)&receive_timeout_ms, sizeof(receive_timeout_ms)) == SOCKET_ERROR ||
        setsockopt(socket_fd, SOL_SOCKET, SO_SNDTIMEO,
            (const char *)&send_timeout_ms, sizeof(send_timeout_ms)) == SOCKET_ERROR) return -1;
    return 0;
#else
    struct timeval receive_timeout = { CLIENT_RECEIVE_TIMEOUT_SECONDS, 0 };
    struct timeval send_timeout = { CLIENT_SEND_TIMEOUT_SECONDS, 0 };
    if (setsockopt(socket_fd, SOL_SOCKET, SO_RCVTIMEO,
            &receive_timeout, sizeof(receive_timeout)) == SOCKET_ERROR ||
        setsockopt(socket_fd, SOL_SOCKET, SO_SNDTIMEO,
            &send_timeout, sizeof(send_timeout)) == SOCKET_ERROR) return -1;
    return 0;
#endif
}

static int is_receive_timeout_error(void) {
#ifdef _WIN32
    return WSAGetLastError() == WSAETIMEDOUT;
#else
    return errno == EAGAIN || errno == EWOULDBLOCK;
#endif
}

static int is_interrupted_error(void) {
#ifdef _WIN32
    return WSAGetLastError() == WSAEINTR;
#else
    return errno == EINTR;
#endif
}

static int parse_request_line(const char *request, char *method, size_t method_capacity,
                              char *target, size_t target_capacity) {
    const char *line_end = strstr(request, "\r\n");
    if (!line_end) return -1;

    size_t line_length = (size_t)(line_end - request);
    const char *first_space = memchr(request, ' ', line_length);
    if (!first_space || first_space == request) return -1;
    const char *target_start = first_space + 1;
    const char *second_space = memchr(target_start, ' ',
        (size_t)(line_end - target_start));
    if (!second_space || second_space == target_start ||
        second_space + 1 == line_end ||
        memchr(second_space + 1, ' ', (size_t)(line_end - second_space - 1))) return -1;

    size_t method_length = (size_t)(first_space - request);
    size_t target_length = (size_t)(second_space - target_start);
    size_t version_length = (size_t)(line_end - second_space - 1);
    if (method_length >= method_capacity || target_length >= target_capacity ||
        version_length != 8 ||
        (memcmp(second_space + 1, "HTTP/1.1", 8) != 0 &&
         memcmp(second_space + 1, "HTTP/1.0", 8) != 0)) return -1;

    for (size_t i = 0; i < method_length; i++) {
        unsigned char ch = (unsigned char)request[i];
        if (ch <= 0x20 || ch >= 0x7f) return -1;
    }
    for (size_t i = 0; i < target_length; i++) {
        unsigned char ch = (unsigned char)target_start[i];
        if (ch <= 0x20 || ch >= 0x7f) return -1;
    }

    memcpy(method, request, method_length);
    method[method_length] = '\0';
    memcpy(target, target_start, target_length);
    target[target_length] = '\0';
    return 0;
}

static int ascii_header_name_equals(const char *name, size_t name_length,
                                    const char *expected) {
    size_t expected_length = strlen(expected);
    if (name_length != expected_length) return 0;
    for (size_t i = 0; i < name_length; i++) {
        if (tolower((unsigned char)name[i]) !=
            tolower((unsigned char)expected[i])) return 0;
    }
    return 1;
}

static int request_body_status(const char *request) {
    const char *request_line_end = strstr(request, "\r\n");
    const char *header_end = strstr(request, "\r\n\r\n");
    if (!request_line_end || !header_end) return -1;

    const char *line = request_line_end + 2;
    while (line < header_end) {
        const char *line_end = strstr(line, "\r\n");
        if (!line_end || line_end > header_end) return -1;
        const char *next_line = line_end + 2;
        const char *colon = memchr(line, ':', (size_t)(line_end - line));
        if (!colon || colon == line) return -1;

        size_t name_length = (size_t)(colon - line);
        const char *value = colon + 1;
        while (value < line_end && (*value == ' ' || *value == '\t')) value++;

        if (ascii_header_name_equals(line, name_length, "Transfer-Encoding")) {
            return value < line_end ? 1 : -1;
        }
        if (ascii_header_name_equals(line, name_length, "Content-Length")) {
            const char *value_end = line_end;
            while (value_end > value &&
                (value_end[-1] == ' ' || value_end[-1] == '\t')) value_end--;
            if (value == value_end) return -1;
            int has_nonzero_digit = 0;
            for (const char *digit = value; digit < value_end; digit++) {
                if (*digit < '0' || *digit > '9') return -1;
                if (*digit != '0') has_nonzero_digit = 1;
            }
            if (has_nonzero_digit) return 1;
        }
        line = next_line;
    }
    return 0;
}

static int send_all(socket_t socket_fd, const char *data, size_t length) {
    while (length > 0) {
        size_t chunk = length > INT_MAX ? INT_MAX : length;
#ifdef _WIN32
        int sent = send(socket_fd, data, (int)chunk, 0);
#else
#ifdef MSG_NOSIGNAL
        ssize_t sent = send(socket_fd, data, chunk, MSG_NOSIGNAL);
#else
        ssize_t sent = send(socket_fd, data, chunk, 0);
#endif
#endif
        if (sent < 0) {
#ifdef _WIN32
            if (WSAGetLastError() == WSAEINTR) continue;
#else
            if (errno == EINTR) continue;
#endif
            return -1;
        }
        if (sent == 0) return -1;
        data += sent;
        length -= (size_t)sent;
    }
    return 0;
}

static int get_server_port(int *port) {
    const char *value = getenv("PORT");
    if (!value || !*value) {
        *port = DEFAULT_PORT;
        return 0;
    }

    errno = 0;
    char *end = NULL;
    long parsed = strtol(value, &end, 10);
    if (errno == ERANGE || end == value || *end != '\0' || parsed < 1 || parsed > 65535) {
        fprintf(stderr, "Invalid PORT value: %s\n", value);
        return -1;
    }
    *port = (int)parsed;
    return 0;
}

static int send_text_response(socket_t client, const char *status, const char *body) {
    char header[1024];
    int header_length = snprintf(header, sizeof(header),
        "HTTP/1.1 %s\r\n"
        "Content-Type: text/plain; charset=utf-8\r\n"
        "Content-Length: %zu\r\n"
        SECURITY_HEADERS
        "Connection: close\r\n\r\n",
        status, strlen(body));
    if (header_length < 0 || (size_t)header_length >= sizeof(header)) return -1;
    if (send_all(client, header, (size_t)header_length) != 0) return -1;
    return send_all(client, body, strlen(body));
}

static int append_format(char *buffer, size_t capacity, size_t *offset,
                         const char *format, ...) {
    if (*offset >= capacity) return -1;
    va_list args;
    va_start(args, format);
    int written = vsnprintf(buffer + *offset, capacity - *offset, format, args);
    va_end(args);
    if (written < 0 || (size_t)written >= capacity - *offset) return -1;
    *offset += (size_t)written;
    return 0;
}

static int append_json_number(char *buffer, size_t capacity, size_t *offset, double value) {
    return isfinite(value)
        ? append_format(buffer, capacity, offset, "%.10g", value)
        : append_format(buffer, capacity, offset, "null");
}

static int build_sequence_response(char *buffer, size_t capacity, size_t *response_length,
                                  const char *expr, const char *type,
                                  int nmin, int nmax, int eval_n, double u0,
                                  double a, double b, int angle_degrees) {
    double values[500];
    int first_n;
    int term_count;
    double eval_u;

    if (strcmp(type, "explicit") == 0) {
        long long count = (long long)nmax - (long long)nmin + 1;
        if (count < 1 || count > 500) return -1;
        first_n = nmin;
        term_count = (int)count;
        for (int i = 0; i < term_count; i++) {
            int n = (int)((long long)nmin + i);
            values[i] = eval_function(expr, (double)n, a, b, angle_degrees);
        }
        eval_u = eval_function(expr, (double)eval_n, a, b, angle_degrees);
    } else {
        if (nmax < 0 || nmax >= 500 || eval_n < 0 || eval_n > nmax) return -1;
        first_n = 0;
        term_count = nmax + 1;
        values[0] = u0;
        for (int i = 1; i < term_count; i++) {
            values[i] = eval_function(expr, values[i - 1], a, b, angle_degrees);
        }
        eval_u = values[eval_n];
    }

    size_t offset = 0;
    if (append_format(buffer, capacity, &offset,
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            SECURITY_HEADERS
            "Access-Control-Allow-Origin: *\r\n"
            "Connection: close\r\n\r\n"
            "{\"type\":\"%s\",\"terms\":[", type) != 0) return -1;

    for (int i = 0; i < term_count; i++) {
        int n = first_n + i;
        if ((i > 0 && append_format(buffer, capacity, &offset, ",") != 0) ||
            append_format(buffer, capacity, &offset, "{\"n\":%d,\"u\":", n) != 0 ||
            append_json_number(buffer, capacity, &offset, values[i]) != 0 ||
            append_format(buffer, capacity, &offset, "}") != 0) return -1;
    }

    if (append_format(buffer, capacity, &offset, "],\"last\":") != 0 ||
        append_json_number(buffer, capacity, &offset, values[term_count - 1]) != 0 ||
        append_format(buffer, capacity, &offset, ",\"evalN\":%d,\"evalU\":", eval_n) != 0 ||
        append_json_number(buffer, capacity, &offset, eval_u) != 0 ||
        append_format(buffer, capacity, &offset, "}") != 0) return -1;

    *response_length = offset;
    return 0;
}

static int handle_sequence_request(socket_t client, const char *query,
                                   char *buffer, size_t capacity) {
    char expr[MAX_EXPRESSION_LENGTH + 1], type[16], nmin_s[32], nmax_s[32], eval_n_s[32];
    char u0_s[32], a_s[32], b_s[32], angle_s[8];
    double u0, parameter_a, parameter_b;
    int nmin, nmax, eval_n;

    if (get_param(query, "expr", expr, sizeof(expr)) < 0 ||
        get_param(query, "type", type, sizeof(type)) < 0 ||
        get_param(query, "nmin", nmin_s, sizeof(nmin_s)) < 0 ||
        get_param(query, "nmax", nmax_s, sizeof(nmax_s)) < 0 ||
        get_param(query, "evalN", eval_n_s, sizeof(eval_n_s)) < 0 ||
        get_param(query, "u0", u0_s, sizeof(u0_s)) < 0 ||
        get_param(query, "a", a_s, sizeof(a_s)) < 0 ||
        get_param(query, "b", b_s, sizeof(b_s)) < 0 ||
        get_param(query, "angle", angle_s, sizeof(angle_s)) < 0 ||
        !expr[0] ||
        (strcmp(type, "explicit") != 0 && strcmp(type, "recursive") != 0) ||
        parse_integer(nmin_s, 0, &nmin) != 0 ||
        parse_integer(nmax_s, 20, &nmax) != 0 ||
        parse_integer(eval_n_s, nmax, &eval_n) != 0 ||
        parse_finite_number(u0_s, 0.0, &u0) != 0 ||
        parse_finite_number(a_s, 1.0, &parameter_a) != 0 ||
        parse_finite_number(b_s, 1.0, &parameter_b) != 0 ||
        (angle_s[0] != '\0' && strcmp(angle_s, "rad") != 0 &&
         strcmp(angle_s, "deg") != 0)) {
        return send_text_response(client, "400 Bad Request", "Invalid sequence parameters\n");
    }

    size_t response_length;
    if (build_sequence_response(buffer, capacity, &response_length, expr, type,
            nmin, nmax, eval_n, u0, parameter_a, parameter_b,
            strcmp(angle_s, "deg") == 0) != 0) {
        return send_text_response(client, "400 Bad Request", "Sequence range exceeds 500 terms\n");
    }
    return send_all(client, buffer, response_length);
}

static int build_plot_response(char *buffer, size_t capacity, size_t *response_length,
                               const char *expr, double xmin, double xmax, double xval,
                               double int_min, double int_max, double a, double b,
                               int angle_degrees, int value_only) {
    size_t offset = 0;
    double yval = eval_function(expr, xval, a, b, angle_degrees);
    if (append_format(buffer, capacity, &offset,
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n"
        SECURITY_HEADERS
        "Access-Control-Allow-Origin: *\r\n"
        "Connection: close\r\n\r\n"
        "{\"xval\":%.10g,\"yval\":", xval) != 0) return -1;

    if (append_format(buffer, capacity, &offset, isfinite(yval) ? "%.6f" : "null", yval) != 0) return -1;
    if (value_only) {
        if (append_format(buffer, capacity, &offset, "}") != 0) return -1;
        *response_length = offset;
        return 0;
    }

    double derivative = derivative_function(expr, xval, a, b, angle_degrees);
    double second_derivative =
        second_derivative_with_context(expr, xval, a, b, angle_degrees);
    double integral = integrate_function(expr, int_min, int_max, a, b, angle_degrees);
    if (append_format(buffer, capacity, &offset,
            ",\"intMin\":%.10g,\"intMax\":%.10g,\"derivative\":",
            int_min, int_max) != 0 ||
        append_format(buffer, capacity, &offset, isfinite(derivative) ? "%.6f" : "null", derivative) != 0 ||
        append_format(buffer, capacity, &offset, ",\"secondDerivative\":") != 0 ||
        append_format(buffer, capacity, &offset,
            isfinite(second_derivative) ? "%.10g" : "null", second_derivative) != 0 ||
        append_format(buffer, capacity, &offset, ",\"integral\":") != 0 ||
        append_format(buffer, capacity, &offset, isfinite(integral) ? "%.6f" : "null", integral) != 0 ||
        append_format(buffer, capacity, &offset, ",\"points\":[") != 0) return -1;

    const int steps = 500;
    const double dx = (xmax - xmin) / steps;
    for (int i = 0; i <= steps; i++) {
        double cx = xmin + i * dx;
        double cy = eval_function(expr, cx, a, b, angle_degrees);
        if ((i > 0 && append_format(buffer, capacity, &offset, ",") != 0) ||
            (isfinite(cx)
                ? (isfinite(cy)
                    ? append_format(buffer, capacity, &offset,
                        "{\"x\":%.10g,\"y\":%.10g}", cx, cy)
                    : append_format(buffer, capacity, &offset,
                        "{\"x\":%.10g,\"y\":null}", cx))
                : append_format(buffer, capacity, &offset,
                    "{\"x\":null,\"y\":null}")) != 0) return -1;
    }
    if (append_format(buffer, capacity, &offset, "],\"derivativePoints\":[") != 0) return -1;

    for (int i = 0; i <= steps; i++) {
        double cx = xmin + i * dx;
        double cy = derivative_function(expr, cx, a, b, angle_degrees);
        if ((i > 0 && append_format(buffer, capacity, &offset, ",") != 0) ||
            (isfinite(cx)
                ? (isfinite(cy)
                    ? append_format(buffer, capacity, &offset,
                        "{\"x\":%.10g,\"y\":%.10g}", cx, cy)
                    : append_format(buffer, capacity, &offset,
                        "{\"x\":%.10g,\"y\":null}", cx))
                : append_format(buffer, capacity, &offset,
                    "{\"x\":null,\"y\":null}")) != 0) return -1;
    }
    if (append_format(buffer, capacity, &offset, "],\"secondDerivativePoints\":[") != 0) return -1;

    for (int i = 0; i <= steps; i++) {
        double cx = xmin + i * dx;
        double cy = second_derivative_with_context(expr, cx, a, b, angle_degrees);
        if ((i > 0 && append_format(buffer, capacity, &offset, ",") != 0) ||
            (isfinite(cx)
                ? (isfinite(cy)
                    ? append_format(buffer, capacity, &offset,
                        "{\"x\":%.10g,\"y\":%.10g}", cx, cy)
                    : append_format(buffer, capacity, &offset,
                        "{\"x\":%.10g,\"y\":null}", cx))
                : append_format(buffer, capacity, &offset,
                    "{\"x\":null,\"y\":null}")) != 0) return -1;
    }
    if (append_format(buffer, capacity, &offset, "]}") != 0) return -1;
    *response_length = offset;
    return 0;
}

static int serve_static_file(socket_t client, const char *filename, const char *content_type,
                             const char *cache_control) {
    FILE *file = fopen(filename, "rb");
    if (!file) return send_text_response(client, "404 Not Found", "Not Found\n");
    if (fseek(file, 0, SEEK_END) != 0) {
        fclose(file);
        return send_text_response(client, "500 Internal Server Error", "Unable to read file\n");
    }

    long file_size = ftell(file);
    if (file_size < 0 || fseek(file, 0, SEEK_SET) != 0) {
        fclose(file);
        return send_text_response(client, "500 Internal Server Error", "Unable to read file\n");
    }

    char header[1024];
    int header_length = snprintf(header, sizeof(header),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %ld\r\n"
        "Cache-Control: %s\r\n"
        SECURITY_HEADERS
        "Connection: close\r\n\r\n",
        content_type, file_size, cache_control);
    if (header_length < 0 || (size_t)header_length >= sizeof(header) ||
        send_all(client, header, (size_t)header_length) != 0) {
        fclose(file);
        return -1;
    }

    char buffer[8192];
    size_t bytes_read;
    int result = 0;
    while ((bytes_read = fread(buffer, 1, sizeof(buffer), file)) > 0) {
        if (send_all(client, buffer, bytes_read) != 0) {
            result = -1;
            break;
        }
    }
    if (ferror(file)) result = -1;
    fclose(file);
    return result;
}

int main(void) {
    int port;
    if (get_server_port(&port) != 0) return 1;

#ifdef _WIN32
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        fprintf(stderr, "Winsock initialization failed.\n");
        return 1;
    }
#endif

    socket_t server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == INVALID_SOCKET) {
        fprintf(stderr, "Unable to create server socket.\n");
#ifdef _WIN32
        WSACleanup();
#endif
        return 1;
    }

    int reuse_address = 1;
#ifdef _WIN32
    int reuse_result = setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR,
        (const char *)&reuse_address, sizeof(reuse_address));
#else
    int reuse_result = setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR,
        &reuse_address, sizeof(reuse_address));
#endif
    if (reuse_result == SOCKET_ERROR) {
        fprintf(stderr, "Unable to enable SO_REUSEADDR.\n");
        close_socket(server_fd);
#ifdef _WIN32
        WSACleanup();
#endif
        return 1;
    }

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    addr.sin_port = htons((unsigned short)port);

#ifdef _WIN32
    int bind_result = bind(server_fd, (struct sockaddr *)&addr, sizeof(addr));
#else
    int bind_result = bind(server_fd, (struct sockaddr *)&addr, (socklen_t)sizeof(addr));
#endif
    if (bind_result == SOCKET_ERROR) {
        fprintf(stderr, "Unable to bind to port %d.\n", port);
        close_socket(server_fd);
#ifdef _WIN32
        WSACleanup();
#endif
        return 1;
    }
    if (listen(server_fd, 16) == SOCKET_ERROR) {
        fprintf(stderr, "Unable to listen on port %d.\n", port);
        close_socket(server_fd);
#ifdef _WIN32
        WSACleanup();
#endif
        return 1;
    }

    printf("C-Math Plotter listening on http://0.0.0.0:%d\n", port);
    char *response = (char *)malloc(RESPONSE_BUFFER_SIZE);
    if (!response) {
        fprintf(stderr, "Unable to allocate response buffer.\n");
        close_socket(server_fd);
#ifdef _WIN32
        WSACleanup();
#endif
        return 1;
    }

    while (1) {
        socket_t client = accept(server_fd, NULL, NULL);
        if (client == INVALID_SOCKET) {
#ifdef _WIN32
            int accept_error = WSAGetLastError();
            if (accept_error == WSAEINTR || accept_error == WSAECONNRESET ||
                accept_error == WSAECONNABORTED) continue;
#else
            if (errno == EINTR || errno == ECONNABORTED) continue;
#endif
            fprintf(stderr, "Unable to accept client connection.\n");
            break;
        }

        if (set_client_timeouts(client) != 0) {
            fprintf(stderr, "Unable to set client socket timeouts.\n");
            close_socket(client);
            continue;
        }

        char req[MAX_HTTP_REQUEST_SIZE + 1] = {0};
        size_t request_length = 0;
        int headers_complete = 0;
        int request_timed_out = 0;
        int request_has_nul = 0;
        time_t request_deadline = time(NULL) + CLIENT_REQUEST_TIMEOUT_SECONDS;
        while (request_length < MAX_HTTP_REQUEST_SIZE) {
            time_t now = time(NULL);
            if (now != (time_t)-1 && now >= request_deadline) {
                request_timed_out = 1;
                break;
            }

            size_t remaining = MAX_HTTP_REQUEST_SIZE - request_length;
#ifdef _WIN32
            int received = recv(client, req + request_length, (int)remaining, 0);
#else
            ssize_t received = recv(client, req + request_length, remaining, 0);
#endif
            if (received < 0) {
                if (is_interrupted_error()) continue;
                if (is_receive_timeout_error()) request_timed_out = 1;
                break;
            }
            if (received == 0) break;
            if (memchr(req + request_length, '\0', (size_t)received)) {
                request_has_nul = 1;
                break;
            }
            request_length += (size_t)received;
            req[request_length] = '\0';
            if (strstr(req, "\r\n\r\n")) {
                headers_complete = 1;
                break;
            }
        }

        if (request_has_nul) {
            send_text_response(client, "400 Bad Request", "Bad Request\n");
            close_socket(client);
            continue;
        }
        const char *header_end = strstr(req, "\r\n\r\n");
        if (header_end &&
            (size_t)(header_end - req) + 4 < request_length) {
            send_text_response(client, "400 Bad Request", "Request body not supported\n");
            close_socket(client);
            continue;
        }
        if (!headers_complete) {
            if (request_length >= MAX_HTTP_REQUEST_SIZE) {
                send_text_response(client, "413 Content Too Large", "Request too large\n");
            } else if (request_timed_out) {
                send_text_response(client, "408 Request Timeout", "Request timed out\n");
            } else if (request_length > 0) {
                send_text_response(client, "400 Bad Request", "Bad Request\n");
            }
            close_socket(client);
            continue;
        }

        char method[16];
        char request_path[1024];
        if (parse_request_line(req, method, sizeof(method),
                request_path, sizeof(request_path)) != 0) {
            send_text_response(client, "400 Bad Request", "Bad Request\n");
            close_socket(client);
            continue;
        }
        if (request_body_status(req) != 0) {
            send_text_response(client, "400 Bad Request", "Request body not supported\n");
            close_socket(client);
            continue;
        }
        char *query_start = strchr(request_path, '?');
        if (query_start) {
            *query_start = '\0';
            query_start++;
        }

        if (strcmp(method, "GET") != 0) {
            send_text_response(client, "405 Method Not Allowed", "Method Not Allowed\n");
            close_socket(client);
            continue;
        }

        const char *static_filename = NULL;
        const char *static_content_type = NULL;
        if (strcmp(request_path, "/") == 0 || strcmp(request_path, "/index.html") == 0) {
            static_filename = "index.html";
            static_content_type = "text/html; charset=utf-8";
        } else if (strcmp(request_path, "/style.css") == 0) {
            static_filename = "style.css";
            static_content_type = "text/css; charset=utf-8";
        } else if (strcmp(request_path, "/script.js") == 0) {
            static_filename = "script.js";
            static_content_type = "text/javascript; charset=utf-8";
        } else if (strcmp(request_path, "/favicon.jpeg") == 0) {
            static_filename = "favicon.jpeg";
            static_content_type = "image/jpeg";
        }
        if (static_filename) {
            const char *cache_control = strcmp(static_filename, "index.html") == 0
                ? "no-cache"
                : "public, max-age=604800";
            (void)serve_static_file(client, static_filename, static_content_type, cache_control);
            close_socket(client);
            continue;
        }

        const char *query = query_start ? query_start : "";
        if (strcmp(request_path, "/sequence") == 0) {
            (void)handle_sequence_request(client, query, response, RESPONSE_BUFFER_SIZE);
            close_socket(client);
            continue;
        }

        if (strcmp(request_path, "/plot") != 0) {
            send_text_response(client, "404 Not Found", "Not Found\n");
            close_socket(client);
            continue;
        }

        char expr[MAX_EXPRESSION_LENGTH + 1], xmin_s[32], xmax_s[32], xval_s[32], value_only_s[8];
        char int_min_s[32], int_max_s[32], a_s[32], b_s[32], angle_s[8];
        double xmin, xmax, xval, int_min, int_max, parameter_a, parameter_b;
        if (get_param(query, "expr", expr, sizeof(expr)) < 0 ||
            get_param(query, "xmin", xmin_s, sizeof(xmin_s)) < 0 ||
            get_param(query, "xmax", xmax_s, sizeof(xmax_s)) < 0 ||
            get_param(query, "xval", xval_s, sizeof(xval_s)) < 0 ||
            get_param(query, "valueOnly", value_only_s, sizeof(value_only_s)) < 0 ||
            get_param(query, "intMin", int_min_s, sizeof(int_min_s)) < 0 ||
            get_param(query, "intMax", int_max_s, sizeof(int_max_s)) < 0 ||
            get_param(query, "a", a_s, sizeof(a_s)) < 0 ||
            get_param(query, "b", b_s, sizeof(b_s)) < 0 ||
            get_param(query, "angle", angle_s, sizeof(angle_s)) < 0 ||
            !expr[0] ||
            parse_finite_number(xmin_s, -10.0, &xmin) != 0 ||
            parse_finite_number(xmax_s, 10.0, &xmax) != 0 ||
            parse_finite_number(xval_s, 0.0, &xval) != 0 ||
            parse_finite_number(int_min_s, xmin, &int_min) != 0 ||
            parse_finite_number(int_max_s, xmax, &int_max) != 0 ||
            parse_finite_number(a_s, 1.0, &parameter_a) != 0 ||
            parse_finite_number(b_s, 1.0, &parameter_b) != 0 ||
            (angle_s[0] != '\0' && strcmp(angle_s, "rad") != 0 &&
             strcmp(angle_s, "deg") != 0) ||
            xmin >= xmax || !isfinite(xmax - xmin)) {
            send_text_response(client, "400 Bad Request", "Invalid numeric parameters\n");
            close_socket(client);
            continue;
        }

        size_t response_length;
        if (build_plot_response(response, RESPONSE_BUFFER_SIZE, &response_length,
                expr, xmin, xmax, xval, int_min, int_max, parameter_a, parameter_b,
                strcmp(angle_s, "deg") == 0, strcmp(value_only_s, "1") == 0) != 0) {
            send_text_response(client, "500 Internal Server Error", "Response too large\n");
        } else {
            (void)send_all(client, response, response_length);
        }
        close_socket(client);
    }

    free(response);
    close_socket(server_fd);
#ifdef _WIN32
    WSACleanup();
#endif
    return 0;
}