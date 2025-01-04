import secureLocalStorage from "react-secure-storage";

export const handleLogin = async (loginEmail, loginPassword) => {
    try {
      if (!loginEmail || !loginPassword) {
        console.log("Both Employee ID and Password are required.");
        return { success: false, error: "Both Employee ID and Password are required." };
      }
      const response = await fetch(`http://localhost:5188/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: loginEmail,
          password: loginPassword
         }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data.message === "Login Success") {
          console.log("Login successful");
          secureLocalStorage.setItem("un", data.user.username);
          secureLocalStorage.setItem("pw", data.user.password);
          secureLocalStorage.setItem("em", data.user.email);
          secureLocalStorage.setItem("pn", data.user.phone);
          secureLocalStorage.setItem("company", data.user.company);
          secureLocalStorage.setItem("address", data.user.address);
          return { success: true, data };
        }
      } else {
        // const data = await response.json();
        return { success: false, error: errorData.error || "Authentication failed." };
      }
    } catch (error) {
      console.error("Error:", error);
      return { success: false, error: "Network error occurred." };
    }
  };