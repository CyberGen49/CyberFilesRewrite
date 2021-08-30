<?php global $theme; ?>
<style>

/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Open+Sans:wght@300;400;600;700;800&display=swap');

* {
    font-family: "Open Sans", sans-serif;
    color: <?= $theme['fg'] ?>;
}

body {
    background: <?= $theme['bg'] ?>;
}

a:hover, a:focus {
    text-decoration: none;
}
    
/* Disables transitions for all child elements */
.no-transitions *:not(.no-transitions-exclude) {
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -ms-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
}

</style>