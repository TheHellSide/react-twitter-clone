export const fetchCurrentUser = async () => {
    const res = await fetch("/me", {
        credentials: "include", // se usi cookie per autenticazione
    });

    if (!res.ok) {
        throw new Error("Failed to fetch current user");
    }

    return res.json();
};