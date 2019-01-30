<template>
    <b-navbar toggleable="md" type="dark" variant="primary">
        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
                <b-nav-item href="#/new-project-page">
                    New project
                </b-nav-item>
                <b-nav-item href="#/project-page" >
                    Projects
                </b-nav-item>
                <b-nav-item href="#/login-page">
                    Authorization
                </b-nav-item>
            </b-navbar-nav>

        </b-collapse>

        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    </b-navbar>
</template>

<script>

export default {
    name: 'navigation',
}
</script>
