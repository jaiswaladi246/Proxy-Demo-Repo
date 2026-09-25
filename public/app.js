async function loadBackendInfo() {

    try {

        const response = await fetch("/api/info");

        const data = await response.json();

        console.log("Backend response:", data);

    } catch (error) {

        console.error("Backend request failed:", error);

    }

}

loadBackendInfo();
