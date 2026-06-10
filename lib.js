window.DataAPI = {

    write(key, value) {

        location.href =
            "https://data-dx5i.onrender.com/api.html" +
            "?action=write" +
            "&key=" + encodeURIComponent(key) +
            "&value=" + encodeURIComponent(value) +
            "&return=" + encodeURIComponent(location.href);
    },

    read(key) {

        location.href =
            "https://data-dx5i.onrender.com/api.html" +
            "?action=read" +
            "&key=" + encodeURIComponent(key) +
            "&return=" + encodeURIComponent(location.href);
    },

    list() {

        location.href =
            "https://data-dx5i.onrender.com/api.html" +
            "?action=list" +
            "&return=" + encodeURIComponent(location.href);
    },

    response() {

        const params =
            new URLSearchParams(location.search);

        const data =
            params.get("data");

        if (!data)
            return null;

        return JSON.parse(data);
    }
};
