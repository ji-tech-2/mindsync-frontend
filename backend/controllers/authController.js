exports.register = (req, res) => {
    const { email, password, username, name, dob, gender, occupation } = req.body;

    console.log("Data diterima dari front-end:");
    console.log(req.body);

    res.json({
        message: "Register berhasil (dummy)",
        data: req.body
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    console.log("Login data:", req.body);

    res.json({
        message: "Login berhasil (dummy)"
    });
};
