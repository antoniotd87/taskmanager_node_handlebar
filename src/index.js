const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// Inicializaciones
const app = express();
require('./database');
require('./config/passport');

// Configuraciones
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main.hbs',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        // allowProtoMethodsByDefault: true
    },
    extname: '.hbs'
}));
app.set('view engine', '.hbs');
// Funciones ejecutadas -- Middlewares
app.use(express.urlencoded({ extends: false }));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Variables Globales
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.error_email = req.flash('error_email');
    res.locals.user = req.user || null;
    next();
});
// Rutas
app.use(require('./routes/index'));
app.use(require('./routes/task'));
app.use(require('./routes/activities'));
app.use(require('./routes/users'));

// Archivos Estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Servidor Iniciado
app.listen(app.get('port'), () => {
    console.log('Servidor en el puerto', app.get('port'));
});