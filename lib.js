window.DataAPI = (() => {

    const API = "https://data-dx5i.onrender.com/api.html";

    const KEY_LAST = "__DATAAPI_LAST__";

    function go(params) {
        const url =
            API + "?" + new URLSearchParams(params).toString();

        // store last action before redirect (prevents data loss)
        sessionStorage.setItem(KEY_LAST, JSON.stringify(params));

        location.href = url;
    }

    function write(key, value, meta = {}) {

        go({
            action: "write",
            key,
            value: JSON.stringify(value),
            meta: JSON.stringify(meta),
            return: location.href
        });
    }

    function read(key, meta = {}) {

        go({
            action: "read",
            key,
            meta: JSON.stringify(meta),
            return: location.href
        });
    }

    function list() {

        go({
            action: "list",
            return: location.href
        });
    }

    function response() {

        const params = new URLSearchParams(location.search);
        const data = params.get("data");

        if (!data) return null;

        try {

            const parsed = JSON.parse(data);

            // cache last successful response
            sessionStorage.setItem(
                KEY_LAST + "_response",
                JSON.stringify(parsed)
            );

            return parsed;

        } catch (e) {

            return data; // fallback raw
        }
    }

    function lastResponse() {

        const cached =
            sessionStorage.getItem(KEY_LAST + "_response");

        return cached ? JSON.parse(cached) : null;
    }

    function clear() {

        sessionStorage.removeItem(KEY_LAST);
        sessionStorage.removeItem(KEY_LAST + "_response");
    }

    return {
        write,
        read,
        list,
        response,
        lastResponse,
        clear
    };

})();
