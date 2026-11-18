#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>
#include <errno.h>
#include <limits.h>

#ifdef _WIN32
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <winsock2.h>
#include <ws2tcpip.h>
typedef SOCKET socket_t;
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
typedef int socket_t;
#define INVALID_SOCKET (-1)
#define SOCKET_ERROR (-1)
#endif

#define DEFAULT_PORT 8080
#define PI_VAL 3.14159265358979323846
#define E_VAL  2.71828182845904523536

// --- 1. PARSEUR MATHÉMATIQUE (Recursive Descent) ---
double parse_expr(const char **p, double x);

void skip_spaces(const char **p) {
    while (**p && isspace((unsigned char)**p)) (*p)++;
}

int starts_primary(const char **p) {
    skip_spaces(p);
    if (**p == '(' || **p == 'x' || **p == 'X' || **p == 'e' ||
        isdigit((unsigned char)**p)) return 1;
    if (**p == '.' && isdigit((unsigned char)(*p)[1])) return 1;
    return strncmp(*p, "sin", 3) == 0 || strncmp(*p, "cos", 3) == 0 ||
           strncmp(*p, "tan", 3) == 0 || strncmp(*p, "sqrt", 4) == 0 ||
           strncmp(*p, "abs", 3) == 0 || strncmp(*p, "exp", 3) == 0 ||
           strncmp(*p, "log", 3) == 0 || strncmp(*p, "ln", 2) == 0 ||
           strncmp(*p, "pi", 2) == 0;
}

double parse_primary(const char **p, double x) {
    skip_spaces(p);

    if (**p == '(') {
        (*p)++;
        double val = parse_expr(p, x);
        skip_spaces(p);
        if (**p == ')') (*p)++;
        return val;
    }

    // Les fonctions w les constantes
    if (strncmp(*p, "sin", 3) == 0)  { *p += 3; return sin(parse_primary(p, x)); }
    if (strncmp(*p, "cos", 3) == 0)  { *p += 3; return cos(parse_primary(p, x)); }
    if (strncmp(*p, "tan", 3) == 0)  { *p += 3; return tan(parse_primary(p, x)); }
    if (strncmp(*p, "sqrt", 4) == 0) { *p += 4; return sqrt(parse_primary(p, x)); }
    if (strncmp(*p, "abs", 3) == 0)  { *p += 3; return fabs(parse_primary(p, x)); }
    if (strncmp(*p, "exp", 3) == 0)  { *p += 3; return exp(parse_primary(p, x)); }
    if (strncmp(*p, "log", 3) == 0)  { *p += 3; return log10(parse_primary(p, x)); }
    if (strncmp(*p, "ln", 2) == 0)   { *p += 2; return log(parse_primary(p, x)); }
    if (strncmp(*p, "pi", 2) == 0)   { *p += 2; return PI_VAL; }

    if (**p == 'x' || **p == 'X') { (*p)++; return x; }
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

double parse_unary(const char **p, double x) {
    skip_spaces(p);
    if (**p == '-') { (*p)++; return -parse_unary(p, x); }
    if (**p == '+') { (*p)++; return parse_unary(p, x); }
    return parse_primary(p, x);
}

double parse_power(const char **p, double x) {
    double base = parse_unary(p, x);
    skip_spaces(p);
    if (**p == '^') {
        (*p)++;
        double exp_val = parse_power(p, x);
        return pow(base, exp_val);
    }
    return base;
}

double parse_term(const char **p, double x) {
    double val = parse_power(p, x);
    while (1) {
        skip_spaces(p);
        if (**p == '*') { (*p)++; val *= parse_power(p, x); }
        else if (**p == '/') { (*p)++; val /= parse_power(p, x); }
        else if (starts_primary(p)) val *= parse_power(p, x);
        else break;
    }
    return val;
}

double parse_expr(const char **p, double x) {
    double val = parse_term(p, x);
    while (1) {
        skip_spaces(p);
        if (**p == '+') { (*p)++; val += parse_term(p, x); }
        else if (**p == '-') { (*p)++; val -= parse_term(p, x); }
        else break;
    }
    return val;
}

double eval_function(const char *expr, double x) {
    const char *p = expr;
    return parse_expr(&p, x);
}

double derivative_function(const char *expr, double x) {
    double h = 1e-5 * fmax(1.0, fabs(x));
    return (eval_function(expr, x + h) - eval_function(expr, x - h)) / (2.0 * h);
}

double integrate_function(const char *expr, double xmin, double xmax) {
    const int steps = 1000;
    double dx = (xmax - xmin) / steps;
    double sum = eval_function(expr, xmin) + eval_function(expr, xmax);

    if (!isfinite(sum)) return NAN;
    for (int i = 1; i < steps; i++) {
        double y = eval_function(expr, xmin + i * dx);
        if (!isfinite(y)) return NAN;
        sum += (i % 2 ? 4.0 : 2.0) * y;
    }
    return sum * dx / 3.0;
}

// --- 2. OUTILS URL & HTTP ---
void url_decode(const char *src, char *dest, int max_len) {
    int i = 0;
    while (*src && i < max_len - 1) {
        if (*src == '%' && isxdigit((unsigned char)src[1]) && isxdigit((unsigned char)src[2])) {
            char hex[3] = { src[1], src[2], '\0' };
            dest[i++] = (char)strtol(hex, NULL, 16);
            src += 3;
        } else if (*src == '+') {
            dest[i++] = ' ';
            src++;
        } else {
            dest[i++] = *src++;
        }
    }
    dest[i] = '\0';
}

void get_param(const char *query, const char *key, char *out, int max_len) {
    out[0] = '\0';
    char search[64];
    snprintf(search, sizeof(search), "%s=", key);
    const char *pos = strstr(query, search);
    if (!pos) return;
    pos += strlen(search);
    const char *end = strpbrk(pos, "& \r\n");
    int len = end ? (int)(end - pos) : (int)strlen(pos);
    char encoded[512];
    if (len >= (int)sizeof(encoded)) len = sizeof(encoded) - 1;
    strncpy(encoded, pos, len);
    encoded[len] = '\0';
    url_decode(encoded, out, max_len);
}

static void close_socket(socket_t socket_fd) {
#ifdef _WIN32
    closesocket(socket_fd);
#else
    close(socket_fd);
#endif
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
    char header[512];
    int header_length = snprintf(header, sizeof(header),
        "HTTP/1.1 %s\r\n"
        "Content-Type: text/plain; charset=utf-8\r\n"
        "Content-Length: %zu\r\n"
        "Connection: close\r\n\r\n",
        status, strlen(body));
    if (header_length < 0 || (size_t)header_length >= sizeof(header)) return -1;
    if (send_all(client, header, (size_t)header_length) != 0) return -1;
    return send_all(client, body, strlen(body));
}

static int serve_static_file(socket_t client, const char *filename, const char *content_type) {
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

    char header[512];
    int header_length = snprintf(header, sizeof(header),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %ld\r\n"
        "X-Content-Type-Options: nosniff\r\n"
        "Connection: close\r\n\r\n",
        content_type, file_size);
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
    char *response = (char *)malloc(131072);
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
        if (client == INVALID_SOCKET) continue;

        char req[4096] = {0};
#ifdef _WIN32
        int received = recv(client, req, (int)sizeof(req) - 1, 0);
#else
        ssize_t received = recv(client, req, sizeof(req) - 1, 0);
#endif
        if (received <= 0) {
            close_socket(client);
            continue;
        }

        char method[16];
        char request_path[1024];
        if (sscanf(req, "%15s %1023s", method, request_path) != 2) {
            send_text_response(client, "400 Bad Request", "Bad Request\n");
            close_socket(client);
            continue;
        }
        char *query_start = strchr(request_path, '?');
        if (query_start) *query_start = '\0';

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
        } else if (strcmp(request_path, "/favicon.jpeg") == 0 ||
                   strcmp(request_path, "/favicon.ico") == 0) {
            static_filename = "favicon.jpeg";
            static_content_type = "image/jpeg";
        }
        if (static_filename) {
            (void)serve_static_file(client, static_filename, static_content_type);
            close_socket(client);
            continue;
        }

        if (strcmp(request_path, "/plot") != 0) {
            send_text_response(client, "404 Not Found", "Not Found\n");
            close_socket(client);
            continue;
        }

        char expr[256], xmin_s[32], xmax_s[32], xval_s[32], value_only_s[8];
        get_param(req, "expr", expr, sizeof(expr));
        get_param(req, "xmin", xmin_s, sizeof(xmin_s));
        get_param(req, "xmax", xmax_s, sizeof(xmax_s));
        get_param(req, "xval", xval_s, sizeof(xval_s));
        get_param(req, "valueOnly", value_only_s, sizeof(value_only_s));

        double xmin = strlen(xmin_s) ? atof(xmin_s) : -10.0;
        double xmax = strlen(xmax_s) ? atof(xmax_s) : 10.0;
        double xval = strlen(xval_s) ? atof(xval_s) : 0.0;
        if (xmin >= xmax) { xmin = -10.0; xmax = 10.0; }

        double yval = eval_function(expr, xval);
        int offset = snprintf(response, 131072,
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Connection: close\r\n\r\n"
            "{\"xval\":%.10g,\"yval\":", xval);

        if (isnan(yval) || isinf(yval)) offset += snprintf(response + offset, 131072 - offset, "null");
        else offset += snprintf(response + offset, 131072 - offset, "%.6f", yval);

        if (strcmp(value_only_s, "1") == 0) {
            offset += snprintf(response + offset, 131072 - offset, "}");
            send_all(client, response, (size_t)offset);
            close_socket(client);
            continue;
        }

        double derivative = derivative_function(expr, xval);
        double integral = integrate_function(expr, xmin, xmax);
        offset += snprintf(response + offset, 131072 - offset, ",\"derivative\":");
        if (!isfinite(derivative)) offset += snprintf(response + offset, 131072 - offset, "null");
        else offset += snprintf(response + offset, 131072 - offset, "%.6f", derivative);
        offset += snprintf(response + offset, 131072 - offset, ",\"integral\":");
        if (!isfinite(integral)) offset += snprintf(response + offset, 131072 - offset, "null");
        else offset += snprintf(response + offset, 131072 - offset, "%.6f", integral);

        offset += snprintf(response + offset, 131072 - offset, ",\"points\":[");

        int steps = 500;
        double dx = (xmax - xmin) / steps;
        for (int i = 0; i <= steps; i++) {
            double cx = xmin + i * dx;
            double cy = eval_function(expr, cx);
            if (i > 0) offset += snprintf(response + offset, 131072 - offset, ",");
            if (isnan(cy) || isinf(cy)) {
                offset += snprintf(response + offset, 131072 - offset, "{\"x\":%.4f,\"y\":null}", cx);
            } else {
                offset += snprintf(response + offset, 131072 - offset, "{\"x\":%.4f,\"y\":%.4f}", cx, cy);
            }
        }
        offset += snprintf(response + offset, 131072 - offset, "],\"derivativePoints\":[");
        for (int i = 0; i <= steps; i++) {
            double cx = xmin + i * dx;
            double cy = derivative_function(expr, cx);
            if (i > 0) offset += snprintf(response + offset, 131072 - offset, ",");
            if (!isfinite(cy)) {
                offset += snprintf(response + offset, 131072 - offset, "{\"x\":%.4f,\"y\":null}", cx);
            } else {
                offset += snprintf(response + offset, 131072 - offset, "{\"x\":%.4f,\"y\":%.4f}", cx, cy);
            }
        }
        offset += snprintf(response + offset, 131072 - offset, "]}");

        send_all(client, response, (size_t)offset);
        close_socket(client);
    }

    free(response);
    close_socket(server_fd);
#ifdef _WIN32
    WSACleanup();
#endif
    return 0;
}