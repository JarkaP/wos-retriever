<template>
    <div style="width:320px">
        <h3 class="mb-3">Project</h3>

        <b-alert variant="info" :show="downloading">
            Records found: {{ progress.recordsFound }}
            <br />
            Records saved: {{ progress.recordsSaved }}
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
                        <b-list-group-item
                            v-if="!chunk.status"
                            :disabled="downloading"
                            href="#"
                            @click="
                                getData(chunk.path, chunk.name, project.dir)
                            "
                        >
                            Get data
                        </b-list-group-item>
                        <b-list-group-item
                            :disabled="downloading"
                            href="#"
                            v-if="chunk.status"
                            >Retry</b-list-group-item
                        >
                        <b-list-group-item
                            :disabled="downloading"
                            href="#"
                            v-if="chunk.status"
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
import soap from 'soap';
import xml2js from 'xml2js';

const electron = require('electron');
const remote = electron.remote;

import globals from '../src/globals';
import getRecordsID from '../src/utils';

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
            },
            xmlOptions: {
                explicitArray: false,
                tagNameProcessors: [xml2js.processors.stripPrefix]
            },
            downloading: false,
            progress: {
                recordsFound: 0,
                recordsSaved: 0
            }
        };
    },
    methods: {
        addSIDHeader: function(client, sidCookie) {
            client.addHttpHeader('Cookie', 'SID=' + sidCookie);
            client.addHttpHeader('Content-Type', 'text/xml; charset=utf-8');
        },

        createResultFile: function(name, dir) {
            if (!fs.existsSync(dir + '/result')) {
                fs.mkdirSync(dir + '/result');
            }

            fs.openSync(dir + '/result/' + name + '.csv', 'a');

            return dir + '/result/' + name + '.csv';
        },

        saveToCSV: function(data) {
            return data;
        },

        loopRequest: function(queryId) {
            console.log(queryId);
        },

        initialRequest: function(data, file, callback) {
            let self = this;
            console.log(data);
            data = data.retrieveByIdResponse.return;
            self.progress.recordsFound = data.recordsFound;
            self.saveToCSV(data.records);
            callback(data.queryId);
        },

        createRequest: function(uids, name, dir) {
            let self = this;
            let pass = localStorage.getItem('sid');
            if (!pass) {
                return (self.error = 'Could not load password');
            }

            let retrieveParameters = {
                databaseId: 'WOS',
                uid: uids,
                queryLanguage: 'en',
                retrieveParameters: {
                    firstRecord: 1,
                    count: 100,
                    option: {
                        key: 'RecordIDs',
                        value: 'On'
                    }
                }
            };
            self.downloading = true;
            soap.createClient(globals.searchUrl, function(err, client) {
                if (err) {
                    self.downloading = false;
                    return (self.error = err);
                }

                self.addSIDHeader(client, pass);

                client.retrieveById(retrieveParameters, function(
                    err,
                    result,
                    rawResponse
                ) {
                    xml2js.parseString(
                        self.decodePointyBrackets(rawResponse),
                        self.xmlOptions,
                        function(err, result) {
                            if (err) {
                                self.downloading = false;
                                return (self.error = err);
                            }

                            let soapBody = result.Envelope.Body;

                            if (soapBody.retrieveByIdResponse == null) {
                                self.downloading = false;
                                return (self.error =
                                    soapBody.Fault.faultstring);
                            } else {
                                let file = self.createResultFile(name, dir);
                                self.initialRequest(
                                    soapBody,
                                    file,
                                    self.loopRequest
                                );
                            }
                        }
                    );
                });
            });
        },

        decodePointyBrackets: function(encodedString) {
            let decodedString = encodedString.replace(/&lt;/g, '<');
            decodedString = decodedString.replace(/&gt;/g, '>');
            return decodedString;
        },

        getData: function(filePath, name, dir) {
            let wosIDs = getRecordsID(filePath);
            this.createRequest(wosIDs, name, dir);
            return;
        },

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
