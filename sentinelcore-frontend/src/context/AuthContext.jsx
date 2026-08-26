import {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken")
    );

    const [refreshToken, setRefreshToken] = useState(
        localStorage.getItem("refreshToken")
    );

    const [username, setUsername] = useState(
        localStorage.getItem("username")
    );

    const [role, setRole] = useState(
        localStorage.getItem("role")
    );

    const loginUser = (
        access,
        refresh,
        loggedInUsername,
        userRole
    ) => {

        setAccessToken(access);
        setRefreshToken(refresh);
        setUsername(loggedInUsername);
        setRole(userRole);

        localStorage.setItem(
            "accessToken",
            access
        );

        localStorage.setItem(
            "refreshToken",
            refresh
        );

        localStorage.setItem(
            "username",
            loggedInUsername
        );

        localStorage.setItem(
            "role",
            userRole
        );
    };

    const logout = () => {

        setAccessToken(null);
        setRefreshToken(null);
        setUsername(null);
        setRole(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
    };

    const isAdmin =
        role === "ROLE_ADMIN";

    const isAuthenticated =
        !!accessToken;

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                username,
                role,
                isAdmin,
                isAuthenticated,
                loginUser,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}