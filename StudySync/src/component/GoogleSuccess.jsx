import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const GoogleSuccess = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {

        const token = searchParams.get("token");

        if (!token) {
            navigate("/login");
            return;
        }

        localStorage.setItem("token", token);

        const getUser = async () => {

            try {

                const response = await axios.get(
                    "http://localhost:9000/auth/google/user",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                navigate("/dashboard");

            } catch (error) {

                console.error(
                    "Failed to get Google user:",
                    error
                );

                localStorage.removeItem("token");

                navigate("/login");

            }

        };

        getUser();

    }, [navigate, searchParams]);

    return (
        <div>
            Logging in with Google...
        </div>
    );
};

export default GoogleSuccess;