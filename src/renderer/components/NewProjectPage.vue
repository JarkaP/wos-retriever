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
                name: ''
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
            fs.mkdirSync(dir + '/results');

            fs.writeFileSync(
                dir + '/' + projectName + '.json',
                JSON.stringify(results),
                'utf8',
                err => {
                    if (err) {
                        return (self.error = false);
                    }
                    console.log('File has been created');
                }
            );

            return;
        }
    }
};
</script>
