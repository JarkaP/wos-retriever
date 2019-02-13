<template>
    <div style="width:320px">
        <h3 class="mb-3">Create New Project</h3>

        <b-alert variant="primary" :show="progress.downloading">
            Records found: {{ progress.recordsFound }}
            <br />
            Records saved: {{ progress.recordsSaved }}
            <ul>
                <li v-for="failed in progress.failed">
                    Record {{ failed }} not saved.
                </li>
            </ul>
        </b-alert>

        <b-alert variant="info" :show="success != false" dismissible>
            <span v-html="success"></span>
        </b-alert>

        <b-alert variant="danger" :show="error != false">
            {{ error }}
        </b-alert>

        <b-form @submit="onSubmit">
            <b-form-group id="name" label="Name of project:" label-for="name">
                <b-form-input
                    id="name"
                    type="text"
                    v-model="form.name"
                    required
                >
                </b-form-input>
            </b-form-group>

            <b-form-group id="query" label="Search query:" label-for="query">
                <b-form-textarea
                    required
                    id="query"
                    v-model="form.query"
                    :rows="3"
                    :max-rows="6"
                >
                </b-form-textarea>
            </b-form-group>

            <b-form-group
                id="begin"
                label="Publication date – begin:"
                label-for="begin"
            >
                <b-form-input
                    v-model="form.begin"
                    type="date"
                    required
                    min="1800-01-01"
                    max="2025-12-31"
                ></b-form-input>
            </b-form-group>

            <b-form-group
                id="end"
                label="Publication date – end:"
                label-for="end"
            >
                <b-form-input
                    v-model="form.end"
                    type="date"
                    required
                    min="1800-01-01"
                    max="2025-12-31"
                ></b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
    </div>
</template>

<script>
import fs from 'fs';
import slugify from 'slugify';
import globals from '../src/globals';
import soap from 'soap';
import xml2js from 'xml2js';

export default {
    name: 'new-project-page',
    data() {
        return {
            form: {
                name: '',
                query: '',
                begin: '2010-01-01',
                end: '2025-12-31'
            },
            error: false,
            success: false,
            progress: {
                downloading: false,
                recordsFound: 0,
                recordsSaved: 0,
                failed: []
            },
            xmlOptions: {
                explicitArray: false,
                tagNameProcessors: [xml2js.processors.stripPrefix]
            }
        };
    },

    mounted: function() {
        this.loadLastQuery();
    },
    methods: {
        parseSingleRecord: function(record) {
            try {
                let parsedRecord = {
                    uid: record.UID,
                    pubyear: record.static_data.summary.pub_info.$.pubyear,
                    citation:
                        record.dynamic_data.citation_related.tc_list.silo_tc.$
                            .local_count,
                    doi: '',
                    issn: '',
                    subjects: '',
                    doctype: ''
                };

                let parsedRecordRow = [];

                let identifiers =
                    record.dynamic_data.cluster_related.identifiers.identifier;

                if (identifiers != null) {
                    if (Object.keys(identifiers).length > 1) {
                        for (
                            let x = 0;
                            x < Object.keys(identifiers).length;
                            x++
                        ) {
                            if (identifiers[x].$.type === 'issn') {
                                parsedRecord.issn = String(
                                    identifiers[x].$.value
                                );
                            }
                            if (identifiers[x].$.type === 'xref_doi') {
                                parsedRecord.doi = String(
                                    identifiers[x].$.value
                                );
                            }
                            if (identifiers[x].$.type === 'doi') {
                                parsedRecord.doi = String(
                                    identifiers[x].$.value
                                );
                            }
                        }
                    } else if (Object.keys(identifiers).length === 1) {
                        if (identifiers.$.type === 'issn') {
                            parsedRecord.issn = String(identifiers.$.value);
                        }
                        if (identifiers.$.type === 'xref_doi') {
                            parsedRecord.doi = String(identifiers.$.value);
                        }
                        if (identifiers.$.type === 'doi') {
                            parsedRecord.doi = String(identifiers.$.value);
                        }
                    }
                }

                let subjectsArr = [];
                let fullrecordMetadata = record.static_data.fullrecord_metadata;
                if (fullrecordMetadata.hasOwnProperty('category_info')) {
                    let subjects =
                        record.static_data.fullrecord_metadata.category_info
                            .subjects.subject;
                    if (subjects != null) {
                        for (let x = 0; x < subjects.length; x++) {
                            if (subjects[x].$.ascatype === 'traditional') {
                                subjectsArr.push(
                                    subjects[x][
                                        Object.keys(subjects[x])[0]
                                    ].replace(/&amp;/g, '&')
                                );
                            }
                        }
                    }
                }

                if (subjectsArr.length > 0) {
                    parsedRecord.subjects = subjectsArr.join('; ');
                }

                let doctypes = record.static_data.summary.doctypes.doctype;
                if (doctypes != null) {
                    if (Array.isArray(doctypes)) {
                        parsedRecord.doctype = doctypes.join('; ');
                    } else {
                        parsedRecord.doctype = doctypes;
                    }
                }

                Object.keys(parsedRecord).map(function(key) {
                    parsedRecordRow.push('"' + parsedRecord[key] + '"');
                });

                return parsedRecordRow;
            } catch (e) {
                console.log(record.UID, e);
                return false;
            }
        },

        saveToCSV: function(data, file) {
            data = data.records.REC;
            let self = this;
            let length = data.length;
            let i = 0;
            for (i; i < length; i++) {
                let parsed = self.parseSingleRecord(data[i]);
                if (parsed) {
                    self.progress.recordsSaved++;

                    fs.open(file, 'a', 666, function(err, id) {
                        if (err) {
                            return (self.error = err);
                        }
                        fs.write(
                            id,
                            parsed.join('\t') + '\n',
                            null,
                            'utf8',
                            function(err2) {
                                if (err2) {
                                    return (self.error = err2);
                                }
                                fs.close(id, function() {});
                            }
                        );
                    });
                } else {
                    self.progress.failed.push(data[i].UID);
                }
            }
        },

        loopRequest: function(queryId, index, indexMax, file, pass) {
            let self = this;
            let firstRecord = globals.countLimit;
            firstRecord = firstRecord + globals.countLimit * index;

            let searchParams = {
                queryId: queryId,
                retrieveParameters: {
                    firstRecord: parseInt(firstRecord) + 1,
                    count: globals.countLimit
                }
            };
            if (index < indexMax) {
                soap.createClient(globals.searchUrl, function(err, client) {
                    if (err) {
                        self.progress.downloading = false;
                        return (self.error = err);
                    }

                    self.addSIDHeader(client, pass);

                    client.retrieve(searchParams, function(
                        err,
                        result,
                        rawResponse
                    ) {
                        xml2js.parseString(
                            self.decodePointyBrackets(rawResponse),
                            self.xmlOptions,
                            function(err, result) {
                                if (err) {
                                    self.error = err;
                                    console.log('retry');
                                    setTimeout(function() {
                                        self.loopRequest(
                                            queryId,
                                            index,
                                            indexMax,
                                            file,
                                            pass
                                        );
                                    }, globals.timeLimit * 2);
                                } else {
                                    let soapBody = result.Envelope.Body;

                                    if (soapBody.retrieveResponse == null) {
                                        self.progress.downloading = false;
                                        return (self.error =
                                            soapBody.Fault.faultstring);
                                    } else {
                                        self.saveToCSV(
                                            soapBody.retrieveResponse.return
                                                .records,
                                            file
                                        );

                                        setTimeout(function() {
                                            self.loopRequest(
                                                queryId,
                                                index + 1,
                                                indexMax,
                                                file,
                                                pass
                                            );
                                        }, globals.timeLimit);
                                        return;
                                    }
                                }
                            }
                        );
                    });
                });
            } else {
                self.progress.downloading = false;
                self.success = 'Download completed. <br>' + file;
                new Notification('WOS', {
                    body: 'Download completed'
                });
                return;
            }
        },

        initialRequest: function(data, file, pass, callback) {
            let self = this;
            data = data.searchResponse.return;
            self.progress.recordsFound = data.recordsFound;
            self.progress.recordsSaved = 0;
            self.progress.failed = [];
            let loopSize =
                parseInt(
                    (data.recordsFound - globals.countLimit) /
                        globals.countLimit
                ) + 1;
            if (data.recordsFound > 99999) {
                self.error = 'Too much results. Try again.';
            } else {
                self.saveToCSV(data.records, file);
                callback(data.queryId, 0, loopSize, file, pass);
            }
        },

        createRequest: function(retrieveParameters, dir) {
            let self = this;
            let pass = localStorage.getItem('sid');
            if (!pass) {
                return (self.error = 'Could not load password');
            }

            let searchParams = {
                queryParameters: {
                    databaseId: 'WOS',
                    userQuery: retrieveParameters.query,
                    editions: globals.wosEditions,
                    timeSpan: {
                        begin: retrieveParameters.begin,
                        end: retrieveParameters.end
                    },
                    queryLanguage: 'en'
                },
                retrieveParameters: {
                    firstRecord: 1,
                    count: globals.countLimit,
                    option: {
                        key: 'targetNamespace',
                        value:
                            'http://scientific.thomsonreuters.com/schema/wok5.4/public/FullRecord'
                    }
                }
            };

            self.progress.downloading = true;

            soap.createClient(globals.searchUrl, function(err, client) {
                if (err) {
                    self.progress.downloading = false;
                    return (self.error = err);
                }

                self.addSIDHeader(client, pass);

                client.search(searchParams, function(err, result, rawResponse) {
                    xml2js.parseString(
                        self.decodePointyBrackets(rawResponse),
                        self.xmlOptions,
                        function(err, result) {
                            if (err) {
                                self.progress.downloading = false;
                                return (self.error = err);
                            }

                            let soapBody = result.Envelope.Body;

                            if (soapBody.searchResponse == null) {
                                self.progress.downloading = false;
                                return (self.error =
                                    soapBody.Fault.faultstring);
                            } else {
                                self.initialRequest(
                                    soapBody,
                                    dir + '/results.csv',
                                    pass,
                                    self.loopRequest
                                );
                            }
                        }
                    );
                });
            });
        },

        onSubmit: function() {
            let self = this;

            localStorage.query = self.form.query;
            localStorage.end = self.form.end;
            localStorage.begin = self.form.begin;

            let projectName = slugify(self.form.name, {
                replacement: '-',
                lower: true
            });
            let dir = globals.homedir + '/wos-retriever/' + projectName;
            let results = [
                {
                    name: projectName,
                    dir: dir,
                    id: Math.floor(new Date() / 1000),
                    data: {
                        query: JSON.stringify(self.form.query),
                        begin: self.form.begin,
                        end: self.form.end
                    }
                }
            ];

            if (!fs.existsSync(globals.homedir + '/wos-retriever')) {
                fs.mkdirSync(globals.homedir + '/wos-retriever');
            }

            if (!fs.existsSync(globals.homedir + '/wos-retriever/errors')) {
                fs.mkdirSync(globals.homedir + '/wos-retriever/errors');
            }

            if (fs.existsSync(dir)) {
                return (self.error = 'Project already exists.');
            }

            fs.mkdirSync(dir);

            fs.writeFileSync(
                dir + '/metadata.json',
                JSON.stringify(results),
                'utf8',
                err => {
                    if (err) {
                        return (self.error = false);
                    }
                    console.log('Metadata file has been created');
                }
            );

            fs.writeFileSync(dir + '/results.csv', '', 'utf8', err => {
                if (err) {
                    return (self.error = false);
                }
                console.log('Results file has been created');
            });

            self.error = false;
            self.success = 'Project created. <br>' + dir;

            self.createRequest(
                {
                    query: self.form.query,
                    begin: self.form.begin,
                    end: self.form.end
                },
                dir
            );
            return;
        },

        decodePointyBrackets: function(encodedString) {
            let decodedString = encodedString.replace(/&lt;/g, '<');
            decodedString = decodedString.replace(/&gt;/g, '>');
            return decodedString;
        },

        addSIDHeader: function(client, sidCookie) {
            client.addHttpHeader('Cookie', 'SID=' + sidCookie);
            client.addHttpHeader('Content-Type', 'text/xml; charset=utf-8');
        },

        loadLastQuery: function() {
            if (localStorage.getItem('query')) {
                this.form.query = localStorage.getItem('query');
            }
            if (localStorage.getItem('begin')) {
                this.form.begin = localStorage.getItem('begin');
            }
            if (localStorage.getItem('end')) {
                this.form.end = localStorage.getItem('end');
            }
        }
    }
};
</script>
