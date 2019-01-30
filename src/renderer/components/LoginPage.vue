<template>
    <div style="width:320px">
        <b-alert variant="success" :show="success != false">
            Login successful
        </b-alert>

        <b-alert variant="danger" :show="error != false">
            {{ error }}
        </b-alert>

        <b-form @submit="onSubmit">
            <b-form-group id="username" label="Username:" label-for="username">
                <b-form-input
                    id="username"
                    type="text"
                    v-model="form.username"
                    required
                >
                </b-form-input>
            </b-form-group>
            <b-form-group id="password" label="Password:" label-for="password">
                <b-form-input
                    id="password"
                    type="password"
                    v-model="form.password"
                    required
                >
                </b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
    </div>
</template>

<script>
import soap from 'soap';
import globals from '../src/globals';
import xml2js from 'xml2js';

export default {
    name: 'login-page',
    data() {
        return {
            form: {
                username: '',
                password: ''
            },
            error: false,
            xmlOptions: {
                explicitArray: false,
                tagNameProcessors: [xml2js.processors.stripPrefix]
            },
            success: false
        };
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault();
            let self = this;

            soap.createClient(globals.authUrl, function(err, client) {
                if (err) {
                    self.error = err;
                    return;
                }

                client.addHttpHeader(
                    'Authorization',
                    'Basic ' +
                        Buffer.from(
                            self.form.username + ':' + self.form.password
                        ).toString('base64')
                );

                client.authenticate({}, function(err, result, rawResponse) {
                    xml2js.parseString(rawResponse, self.xmlOptions, function(
                        err,
                        result
                    ) {
                        if (err) {
                            return (self.error = err);
                        }
                        let soapBody = result.Envelope.Body;

                        if (soapBody.authenticateResponse == null) {
                            self.error = soapBody.Fault.faultstring;
                            return;
                        } else {
                            self.error = false;
                            self.success = true;
                            localStorage.sid =
                                soapBody.authenticateResponse.return;
                            return;
                        }
                    });
                });
            });
        }
    }
};
</script>
