const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
} = require("./utils/contacts");
const { body, validationResult, check } = require("express-validator");
const sesion = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const app = express();
const port = 3000;
//root
//gunakan ejs
app.set("view engine", "ejs");

//third party middleware
app.use(expressLayouts);

//build in middleware
app.use(express.static("public"));

//body parser
app.use(express.urlencoded({ extended: true }));

//konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  sesion({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Angga",
      email: "galih,angga524@gmail.com",
    },
    {
      nama: "Yolan",
      email: "Yolan@gmail.com",
    },
    {
      nama: "Arriva",
      email: "kaka@gmail.com",
    },
  ];
  res.render("index", {
    name: "Angga",
    title: "Home",
    mahasiswa,
    layout: "layouts/main-layout",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "About",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();

  res.render("contact", {
    layout: "layouts/main-layout",
    title: "contact",
    contacts,
    msg: req.flash("msg"),
  });
});
//halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "Form Tambah Contact",
  });
});

//proses data contact
app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "email tidak valid").isEmail(),
    check("noHP", "nomer hp tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("add-contact", {
        layout: "layouts/main-layout",
        title: "Form Tambah Contact",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      //mengirimkan flash message
      req.flash("msg", "Data contact berhasil ditambahkan");
      res.redirect("/contact");
    }
  }
);

//halaman detail contact
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "detail contact",
    contact,
  });
});

app.use((req, res) => {
  res.status(404);
  res.send("404");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
