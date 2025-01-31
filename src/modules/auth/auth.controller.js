import dotenv from "dotenv"

export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      // Example login logic
      const findUser = users.find((data) => email === data.email);
      if (!findUser) {
        return res.status(400).send("Wrong email or password!");
      }
      const passwordMatch = await bcrypt.compare(password, findUser.password);
      if (passwordMatch) {
        return res.status(200).send("Logged in successfully!");
      } else {
        return res.status(400).send("Wrong email or password!");
      }
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  };

