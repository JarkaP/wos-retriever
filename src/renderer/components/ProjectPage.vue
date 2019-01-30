<template>
    <div style="width:320px">
        <h3 class="mb-3">Project</h3>

        <b-alert variant="success" :show="success != false">
            Successfully created project <br />
            {{}}
        </b-alert>

        <b-alert variant="danger" :show="error != false">
            {{ error }}
        </b-alert>

        <button v-if="!project.open" @click="loadProject">Load project</button>
        <div v-else>
            <b-alert :show="project.open" dismissible variant="success">
                Project loaded.
            </b-alert>

            <h5>{{ project.name }}</h5>
            <p>Path: {{ project.dir }}</p>

            <b-card-group
                deck
                v-for="(chunk, index) in project.chunks"
                :key="index"
                class="my-3"
            >
                <b-card :header="chunk.name">
                    <b-list-group>
                        <b-list-group-item v-if="!chunk.status" href="#">
                            Get data
                        </b-list-group-item>
                        <b-list-group-item href="#" v-if="chunk.status"
                            >Retry</b-list-group-item
                        >
                        <b-list-group-item href="#" v-if="chunk.status"
                            >View</b-list-group-item
                        >
                    </b-list-group>
                </b-card>
            </b-card-group>
        </div>
    </div>
</template>

<script>
import fs from 'fs';
//import parse from 'csv-parse/lib/sync';
//import globals from '../src/globals';

const electron = require('electron');
const remote = electron.remote; //

import globals from '../src/globals';

export default {
    name: 'project-page',
    data() {
        return {
            error: false,
            success: false,
            project: {
                name: '',
                open: false,
                chunks: [],
                dir: ''
            }
        };
    },
    methods: {
        loadProject: function() {
            let self = this;
            let projectDir = globals.homedir + '/wos-retriever';
            if (!fs.existsSync(projectDir)) {
                projectDir = globals.homedir;
            }

            remote.dialog.showOpenDialog(
                {
                    properties: ['openFile'],
                    defaultPath: projectDir,
                    filters: [{ name: 'json', extensions: ['json'] }]
                },
                function(file) {
                    fs.readFile(file[0], (err, data) => {
                        if (err) {
                            console.log(err);
                            return (self.error = err);
                        }
                        let projectData = JSON.parse(data)[0];

                        let chunks = [];
                        fs.readdirSync(projectData.dir + '/chunks').forEach(
                            chunk => {
                                chunks.push({
                                    path: projectData.dir + '/chunks/' + chunk,
                                    name: chunk,
                                    status: false
                                });
                            }
                        );

                        self.project = {
                            name: projectData.name,
                            open: true,
                            dir: projectData.dir,
                            chunks: chunks
                        };
                    });
                }
            );
        }
    }
};
</script>
