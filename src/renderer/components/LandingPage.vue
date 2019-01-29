<template>
    <div style="width:320px">
        <b-list-group>
            <b-list-group-item href="#/new-project-page">New project</b-list-group-item>
            <b-list-group-item href="#/project-page">Projects</b-list-group-item>
            <b-list-group-item href="#/login-page">Authorization link</b-list-group-item>
        </b-list-group>
    </div>
</template>

<script>
export default {
    name: 'landing-page',
}
/*
import SystemInformation from './LandingPage/SystemInformation'

export default {
name: 'landing-page',
components: { SystemInformation },
methods: {
open (link) {
this.$electron.shell.openExternal(link)
}
}
}

*/
</script>
