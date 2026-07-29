(function installQvRuntimeConfig(scope) {
    if (scope.__QV_RUNTIME_CONFIG__ != null) return;

    scope.__QV_RUNTIME_CONFIG__ = Object.freeze({
        backendMode: 'local-preview',
        apiBaseUrl: '',
        webSocketBaseUrl: '',
        cdnBaseUrl: '',
        requestTimeoutMs: 10000,
        clientVersion: '',
        resourceVersion: '',
        channel: '',
    });
})(globalThis);
