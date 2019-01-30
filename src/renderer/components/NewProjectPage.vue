<template>
    <div style="width:320px">
        <h3 class="mb-3">Create New Project</h3>

        <b-alert variant="success" :show="success != false">
            Successfully created project <br />
            {{ path }}
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

            <b-form-group id="datafile" label="Data:" label-for="datafile">
                <b-form-file
                    v-model="form.datafile"
                    plain
                    accept=".txt, .csv"
                    required
                >
                </b-form-file>
                <div class="mt-1">
                    Selected file: {{ form.datafile && form.datafile.name }}
                </div>
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
    </div>
</template>

<script>
import fs from 'fs';
import slugify from 'slugify';
import flatten from '@flatten/array';
import parse from 'csv-parse/lib/sync';
import globals from '../src/globals';

export default {
    name: 'new-project-page',
    data() {
        return {
            form: {
                name: '',
                datafile: null
            },
            error: false,
            success: false,
            path: ''
        };
    },
    methods: {
        onSubmit: function() {
            let self = this;
            let projectName = slugify(self.form.name, {
                replacement: '-',
                lower: true
            });
            let dir = globals.homedir + '/wos-retriever/' + projectName;
            let results = [
                {
                    name: projectName,
                    dir: dir,
                    id: Math.floor(new Date() / 1000)
                }
            ];
            if (!fs.existsSync(globals.homedir + '/wos-retriever')) {
                fs.mkdirSync(globals.homedir + '/wos-retriever');
            }

            if (fs.existsSync(dir)) {
                return (self.error = 'Project already exists.');
            }

            fs.mkdirSync(dir);
            fs.mkdirSync(dir + '/chunks');

            let chunks = self.chunkInputData(
                self.form.datafile.path,
                dir + '/chunks/'
            );

            if (Array.isArray(chunks)) {
                self.path = dir;
                self.error = false;
                self.success = true;
                fs.writeFileSync(
                    dir + '/wos-retriver-project.json',
                    JSON.stringify(results),
                    'utf8',
                    err => {
                        if (err) {
                            return console.error(err);
                        }
                        console.log('File has been created');
                    }
                );
            } else {
                self.error = 'Something went wrong';
            }

            return;
        },

        chunkArray: function(originalArray, chunkSize) {
            let index = 0;
            let arrayLength = originalArray.length;
            let tempArray = [];

            for (index = 0; index < arrayLength; index += chunkSize) {
                let chunk = originalArray.slice(index, index + chunkSize);
                tempArray.push(chunk);
            }

            return tempArray;
        },

        getRecordsID: function(dataFile) {
            let file = fs.readFileSync(dataFile, 'utf8');

            let wosIDs = parse(file, {
                skip_empty_lines: true
            });

            return flatten(wosIDs);
        },

        chunkInputData: function(datafile, dir) {
            let self = this;
            let data = self.getRecordsID(datafile);
            let uids = self.chunkArray(data, globals.idLimit);
            let results = [];
            for (let i = 0; i < uids.length; i++) {
                let filepath = dir + 'data-' + i;
                fs.openSync(filepath, 'w');
                let file = fs.createWriteStream(filepath);

                file.on('error', function(err) {
                    console.log(err);
                    return false;
                });

                uids[i].forEach(function(v) {
                    file.write(v + '\n');
                });

                file.on('finish', function() {
                    results.push(filepath);
                    console.log('chunk ' + i + ' created');
                });

                file.end();
            }

            return results;
        }
    }
};
</script>
