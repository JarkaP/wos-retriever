<template>
    <div style="width:320px">
        <h3 class="mb-3">Create New Project</h3>

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
            success: false
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
            return;
        }
    }
};
</script>
