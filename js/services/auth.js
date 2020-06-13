import h3 from "../h3.js";

const processCode = async () => {
  if (location.search.match(/code=([^&]+)/)) {
    const response = await fetch("http://localhost:10101/code-grant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: location.search.match(/code=([^&]+)/)[1],
      }),
    });
    if (response.ok) {
      console.log(await response.json());
    }
  }
};

const authorize = () => {
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${h3.state.config.clientId}&scope=gist&redirect_uri=${location.origin}${location.pathname}`;
};

const authorized = () => {
  return h3.state.config.user || h3.state.config.storage !== "gist";
}

export { processCode, authorize, authorized };
