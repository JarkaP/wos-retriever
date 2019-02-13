/* global require module */

const homedir = require('os').homedir();

const searchUrl =
    'http://search.webofknowledge.com/esti/wokmws/ws/WokSearch?wsdl';
const authUrl =
    'http://search.webofknowledge.com/esti/wokmws/ws/WOKMWSAuthenticate?wsdl';

const countLimit = 100;
const idLimit = 15000;
const timeLimit = 600;
const wosEditions = [
    {
        collection: 'WOS',
        edition: 'SCI'
    },
    {
        collection: 'WOS',
        edition: 'SSCI'
    },
    {
        collection: 'WOS',
        edition: 'AHCI'
    },
    {
        collection: 'WOS',
        edition: 'ISTP'
    },
    {
        collection: 'WOS',
        edition: 'ISSHP'
    },
    {
        collection: 'WOS',
        edition: 'IC'
    },
    {
        collection: 'WOS',
        edition: 'CCR'
    },
    {
        collection: 'WOS',
        edition: 'BSCI'
    },
    {
        collection: 'WOS',
        edition: 'BHCI'
    },
    {
        collection: 'WOS',
        edition: 'ESCI'
    }
];

module.exports = {
    searchUrl,
    authUrl,
    countLimit,
    timeLimit,
    idLimit,
    wosEditions,
    homedir
};
