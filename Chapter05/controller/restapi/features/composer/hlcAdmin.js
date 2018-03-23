/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';
const fs = require('fs');
const path = require('path');
const _home = require('os').homedir();
const hlc_idCard = require('composer-common').IdCard;
const composerAdmin = require('composer-admin');
const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const config = require('../../../env.json');
const NS = 'org.acme.Z2BTestNetwork';
// const svc = require('./Z2B_Services');
// const mod = 'hlcAdmin.js';

/**
 * display the admin and network info
 * @constructor
 */

exports.getCreds = function(req, res, next) {
    res.send(config);
};

/**
 * Create an instance of the AdminConnection class (currently a no-op)
 * @constructor
 */
exports.adminNew = function() {

};

/**
 * connect to the network
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @function
 */
exports.adminConnect = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        console.log('create connection successful ');
        res.send({connection: 'succeeded'});
    })
    .catch(function(error){
        console.log('create connection failed: ',error);
        res.send(error);
    });
};

/**
 * Stores a connection profile into the profile store being used by this AdminConnection.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.profileName: _string - string name of object - not used in current implementation
 * req.body.data:  _object - the object to be parsed
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @function
 */
exports.createProfile = function(req, res, next) {
    let adminOptions = {
        type: req.body.type,
        keyValStore: req.body.keyValStore,
        channel: req.body.channel,
        mspID: req.body.mspID,
        timeout: req.body.timeout,
        orderers: [{url: req.body.orderers.url}],
        ca: {url: req.body.ca.url, name: req.body.ca.name},
        peers: [{eventURL: req.body.peers.eventURL, requestURL: req.body.peers.requestRUL}]
    };
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        adminConnection.createProfile(req.body.profileName, adminOptions)
            .then(function(result){
                console.log('create profile successful: ');
                res.send({profile: 'succeeded'});
            })
            .catch(function(error){
                console.log('create profile failed: ',error);
                res.send({profile: error});
            });
    });
};
/**
 * Deletes the specified connection profile from the profile store being used by this AdminConnection.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.connectionProfile: _string - string name of object
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns composerAdmin.connection - either an error or a connection object
 * @function
 */
exports.deleteProfile = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        adminConnection.deleteProfile(req.body.profileName)
            .then(function(result){
                console.log('delete profile successful: ',result);
                res.send({profile: 'succeeded'});
            })
            .catch(function(error){
                console.log('delete profile failed: ',error);
                res.send({profile: error});
            });
    });
};

/**
 * Deploys a new BusinessNetworkDefinition to the Hyperledger Fabric. The connection must be connected for this method to succeed.
 * This method will be superceded in v0.17, possibly as early as v0.16, with adminConnection.start(), which will create the necessary 
 * business network admin id as part of the start process, in line with how the cli now operates
 * @param {express.req} req - the inbound request object from the client
 *  req.body.myArchive: _string - string name of object
 *  req.body.deployOptions: _object - string name of object
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {composerAdmin.connection} - either an error or a connection object
 * @function
 */
exports.deploy = function(req, res, next) {

    let archiveFile = fs.readFileSync(path.join(path.dirname(require.main.filename),'network/dist',req.body.myArchive));

    let adminConnection = new composerAdmin.AdminConnection();

    return BusinessNetworkDefinition.fromArchive(archiveFile)
        .then(function(archive) {
        // connection prior to V0.15
        //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
        // connection in v0.15
            adminConnection.connect(config.composer.adminCard)
            .then(function(){
                adminConnection.deploy(archive)
                    .then(function(){
                        console.log('business network '+req.body.myArchive+' deployed successful: ');
                        res.send({deploy: req.body.myArchive+' deploy succeeded'});
                    })
                    .catch(function(error){
                        console.log('business network '+req.body.myArchive+' deploy failed: ',error);
                        res.send({deploy: error});
                    });
            });
        });
};
/**
 * Installs a new BusinessNetworkDefinition to the Hyperledger Fabric. The connection must be connected for this method to succeed.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.myArchive: _string - string name of object
 *  req.body.deployOptions: _object - string name of object
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {composerAdmin.connection} - either an error or a connection object
 * @function
 */
exports.networkInstall = function(req, res, next) {

    let archiveFile = fs.readFileSync(path.join(path.dirname(require.main.filename),'network/dist',req.body.myArchive));

    let adminConnection = new composerAdmin.AdminConnection();
    return BusinessNetworkDefinition.fromArchive(archiveFile)
    .then((businessNetworkDefinition) => {
        // connection prior to V0.15
        //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
        // connection in v0.15
        adminConnection.connect(config.composer.adminCard)
        .then(() => {
        // ========> Your Code Goes Here <=========
        })
        .catch((error) => {console.log('error with adminConnection.connect', error.message);
            res.send({install: error.message});
        });
    })
    .catch((error) => {console.log('error with fromArchive', error.message);
        res.send({install: error.message});
    });
};

/**
 * Starts a new BusinessNetworkDefinition to the Hyperledger Fabric. The connection must be connected for this method to succeed.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.networkName: _string - string name of network
 *  req.body.deployOptions: _object - string name of object
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {composerAdmin.connection} - either an error or a connection object
 * @function
 */
exports.networkStart = function(req, res, next) {

    let archiveFile = fs.readFileSync(path.join(path.dirname(require.main.filename),'network/dist',req.body.myArchive));
    let adminConnection = new composerAdmin.AdminConnection();

    return BusinessNetworkDefinition.fromArchive(archiveFile)
        .then(function(archive) {
        // connection prior to V0.15
        //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
        // connection in v0.15
            adminConnection.connect(config.composer.adminCard)
            .then(function(){
        // ========> Your Code Goes Here <=========
    });
        });
};

/**
 * disconnects this connection
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns composerAdmin.connection - either an error or a connection object
 * @function
 */
exports.disconnect = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        // ========> Your Code Goes Here <=========
    });
};
/**
 * Retrieve all connection profiles from the profile store being used by this AdminConnection.
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns composerAdmin.connection - either an error or a connection object
 * @function
 */
exports.getAllProfiles = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        // ========> Your Code Goes Here <=========
    });
};
/**
 * Retrieve the specified connection profile from the profile store being used by this AdminConnection.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.connectionProfile: _string - string name of object
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns composerAdmin.connection - either an error or a connection object
 * @function
 */
exports.getProfile = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        // ========> Your Code Goes Here <=========
    });
};
/**
 * List all of the deployed business networks. The connection must be connected for this method to succeed.
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns composerAdmin.connection - either an error or a connection object
 * @function
 */
exports.listAsAdmin = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // updated to use PeerAdmin, PeerPW to work with V0.14
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    console.log('config.composer.PeerCard: '+config.composer.PeerCard);
    adminConnection.connect(config.composer.PeerCard)
    .then(function(){
        // ========> Your Code Goes Here <=========
    });
};
/**
 * Test the connection to the runtime and verify that the version of the runtime is compatible with this level of the node.js module.
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns composerAdmin.connection - either an error or a connection object
 * @function
 */
exports.ping = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        // ========> Your Code Goes Here <=========
    });
};
/**
 * Undeploys a BusinessNetworkDefinition from the Hyperledger Fabric. The business network will no longer be able to process transactions.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.businessNetwork: _string - name of network to remove
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns composerAdmin.connection - either an error or a connection object
 * @function
 */
exports.undeploy = function(req, res, next) {
    let adminConnection = new composerAdmin.AdminConnection();
    // connection prior to V0.15
    //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    adminConnection.connect(config.composer.adminCard)
    .then(function(){
        // ========> Your Code Goes Here <=========
    });
};
/**
 * Updates an existing BusinessNetworkDefinition on the Hyperledger Fabric. The BusinessNetworkDefinition must have been previously deployed.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.myArchive: _string - name of archive to deploy
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {composerAdmin.connection} - either an error or a connection object
 * @function
 */
exports.update = function(req, res, next) {

    let netName = req.body.myArchive.split('.')[0];
    let archiveFile = fs.readFileSync(path.join(path.dirname(require.main.filename),'network/dist',req.body.myArchive));

    let adminConnection = new composerAdmin.AdminConnection();

    return BusinessNetworkDefinition.fromArchive(archiveFile)
    .then(function(archive) {
        // connection prior to V0.15
        //    adminConnection.connect(config.composer.connectionProfile, config.composer.adminID, config.composer.adminPW)
        // connection in v0.15
        adminConnection.connect(config.composer.adminCard)
        .then(function(){
        // ========> Your Code Goes Here <=========
        });
    });
};

/**
 * retrieve array of member registries
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Object} array of registries
 * @function
 */
exports.getRegistries = function(req, res, next)
{
    // get the autoload file
    // connect to the network
    let allRegistries = new Array();
    let businessNetworkConnection;
    businessNetworkConnection = new BusinessNetworkConnection();
    // connection prior to V0.15
    // return businessNetworkConnection.connect(config.composer.connectionProfile, config.composer.network, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    return businessNetworkConnection.connect(config.composer.adminCard)
        .then(() => {
        // ========> Your Code Goes Here <=========
    })
        .catch((error) => {console.log('error with business network Connect', error);});
};

/**
 * retrieve array of members from specified registry type
 * @param {express.req} req - the inbound request object from the client
 *  req.body.registry: _string - type of registry to search; e.g. 'Buyer', 'Seller', etc.
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Object} an array of members
 * @function
 */
exports.getMembers = function(req, res, next) {
    // connect to the network
    // let method = 'getMembers';
    let allMembers = new Array();
    let businessNetworkConnection;
    businessNetworkConnection = new BusinessNetworkConnection();
    // connection prior to V0.15
    // return businessNetworkConnection.connect(config.composer.connectionProfile, config.composer.network, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    return businessNetworkConnection.connect(config.composer.adminCard)
        .then(() => {
            return businessNetworkConnection.getParticipantRegistry(NS+'.'+req.body.registry)
            .then(function(registry){
        // ========> Your Code Goes Here <=========
    })
        .catch((error) => {console.log('error with getRegistry', error);
            res.send({'result': 'failed '+error.message, 'members': []});});
        })
        .catch((error) => {console.log('error with business network Connect', error.message);
            res.send({'result': 'failed '+error.message, 'members': []});});
};

/**
 * Checks to see if the provided id already has a card issued for it
 * @param {express.req} req - the inbound request object from the client
 *  req.body.id - the id of the individual making the request
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns {object} - a JSON object
 * @function
 */
exports.checkCard = function(req, res, next) {
    let adminConnection = new AdminConnection();
    adminConnection.connect(config.composer.adminCard)
    .then(() => {
        // ========> Your Code Goes Here <=========
    })
    .catch((error) => {
        res.send({'result': 'admin Connect failed', 'message': error.message});
    });
};

/**
 * Creates a card for an existing member
 * @param {express.req} req - the inbound request object from the client
 *  req.body.id - the id of the individual making the request
 *  req.body.pw - the pw of the individual making the request
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * returns {object} - a JSON object
 * @function
 */
exports.createCard = function(req, res, next) {
    let adminConnection = new AdminConnection();
    let _meta = {};
    for (let each in config.composer.metaData)
    {(function(_idx, _obj) {_meta[_idx] = _obj[_idx]; })(each, config.composer.metaData); }
    _meta.businessNetwork = config.composer.network;
    _meta.userName = req.body.id;
    _meta.enrollmentSecret = req.body.secret;
    config.connectionProfile.keyValStore = _home+config.connectionProfile.keyValStore;
    let tempCard = new hlc_idCard(_meta, config.connectionProfile);
    adminConnection.connect(config.composer.adminCard)
    .then(() => {
        // ========> Your Code Goes Here <=========
    })
    .catch((error) => {
        console.error('adminConnection.connect failed. ',error.message);
        res.send({'result': 'failed', 'error': error.message});
    });
};

/**
 * creates an identity for a member already created in a member registry
 * @param {express.req} req - the inbound request object from the client
 *  req.body.id - the id of the individual making the request
 *  req.body.type - the member type of the individual making the request
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {object} - a JSON object
 * @function
 */
exports.issueIdentity = function(req, res, next) {
    let businessNetworkConnection = new BusinessNetworkConnection();
    return businessNetworkConnection.connect(config.composer.adminCard)
    .then(() => {
        console.log('issuing identity for: '+config.composer.NS+'.'+req.body.type+'#'+req.body.id);
        // ========> Your Code Goes Here <=========
    })
    .catch((error) => {
        res.send({'result': 'business network Connect failed', 'message': error.message});
    });
};

/**
 * gets the assets from the order registry
 * @param {express.req} req - the inbound request object from the client
 *  req.body.type - the type of individual making the request (admin, buyer, seller, etc)
 *  req.body.id - the id of the individual making the request
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} - an array of assets
 * @function
 */
exports.getAssets = function(req, res, next) {
    // connect to the network
    let allOrders = new Array();
    let businessNetworkConnection;
    let serializer;
    let archiveFile = fs.readFileSync(path.join(path.dirname(require.main.filename),'network','dist','zerotoblockchain-network.bna'));
    businessNetworkConnection = new BusinessNetworkConnection();
    return BusinessNetworkDefinition.fromArchive(archiveFile)
    .then((bnd) => {
        serializer = bnd.getSerializer();
        // connection prior to V0.15
        // return businessNetworkConnection.connect(config.composer.connectionProfile, config.composer.network, config.composer.adminID, config.composer.adminPW)
        // connection in v0.15
        return businessNetworkConnection.connect(config.composer.adminCard)
            .then(() => {
                return businessNetworkConnection.getAssetRegistry(NS+'.'+req.body.registry)
                    .then(function(registry){
                        return registry.getAll()
                        .then ((members) => {
                            console.log('there are '+members.length+' entries in the '+req.body.registry+' Registry with id: '+members[0].$namespace);
                            for (let each in members)
                                { (function (_idx, _arr)
                                    {
                                    switch(req.body.type)
                                    {
                                    case 'Buyer':
                                        if (req.body.id === _arr[_idx].buyer.$identifier)
                                        {
                                            let _jsn = serializer.toJSON(_arr[_idx]);
                                            _jsn.type = req.body.registry;
                                            switch (req.body.registry)
                                            {
                                            case 'Order':
                                                _jsn.id = _arr[_idx].orderNumber;
                                                break;
                                            default:
                                                _jsn.id = _arr[_idx].id;
                                            }
                                            allOrders.push(_jsn);
                                        }
                                        break;
                                    case 'admin':
                                        let _jsn = serializer.toJSON(_arr[_idx]);
                                        _jsn.type = req.body.registry;
                                        switch (req.body.registry)
                                        {
                                        case 'Order':
                                            _jsn.id = _arr[_idx].orderNumber;
                                            break;
                                        default:
                                            _jsn.id = _arr[_idx].id;
                                        }
                                        allOrders.push(_jsn);
                                        break;
                                    default:
                                        break;
                                    }
                                })(each, members);
                            }
                            res.send({'result': 'success', 'orders': allOrders});
                        })
                        .catch((error) => {console.log('error with getAllOrders', error);
                            res.send({'result': 'failed', 'error': 'getAllOrders: '+error.message});
                        });
                    })
                    .catch((error) => {console.log('error with getRegistry', error);
                        res.send({'result': 'failed', 'error': 'getRegistry: '+error.message});
                    });
            })
            .catch((error) => {console.log('error with business network Connect', error);
                res.send({'result': 'failed', 'error': 'business network Connect: '+error.message});
            });
    });
};

/**
 * Adds a new member to the specified registry
 * @param {express.req} req - the inbound request object from the client
 *  req.body.companyName: _string - member company name
 *  req.body.type: _string - member type (registry type); e.g. 'Buyer', 'Seller', etc.
 *  req.body.id: _string - id of member to add (email address)
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {JSON} object with success or error results
 * @function
 */
exports.addMember = function(req, res, next) {
    let businessNetworkConnection;
    let factory;
    businessNetworkConnection = new BusinessNetworkConnection();
    // connection prior to V0.15
    // return businessNetworkConnection.connect(config.composer.connectionProfile, config.composer.network, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    return businessNetworkConnection.connect(config.composer.adminCard)
    .then(() => {
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
        return businessNetworkConnection.getParticipantRegistry(NS+'.'+req.body.type)
        .then(function(participantRegistry){
        // ========> Your Code Goes Here <=========
    })
        .catch((error) => {console.log('error with getParticipantRegistry', error); res.send(error);});
    })
    .catch((error) => {console.log('error with businessNetworkConnection', error); res.send(error);});
};

/**
 * Removes a member from a registry.
 * @param {express.req} req - the inbound request object from the client
 *  req.body.registry: _string - type of registry to search
 *  req.body.id: _string - id of member to delete
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {JSON} object with success or error results
 * @function
 */
exports.removeMember = function(req, res, next) {
    let businessNetworkConnection;
    businessNetworkConnection = new BusinessNetworkConnection();
    // connection prior to V0.15
    // return businessNetworkConnection.connect(config.composer.connectionProfile, config.composer.network, config.composer.adminID, config.composer.adminPW)
    // connection in v0.15
    return businessNetworkConnection.connect(config.composer.adminCard)
    .then(() => {
        return businessNetworkConnection.getParticipantRegistry(NS+'.'+req.body.registry)
        .then(function(participantRegistry){
            return participantRegistry.get(req.body.id)
            .then((_res) => {
        // ========> Your Code Goes Here <=========
    })
            .catch((_res) => { res.send('member id '+req.body.id+' does not exist in the '+req.body.registry+' member registry.');});
        })
        .catch((error) => {console.log('error with getParticipantRegistry', error); res.send(error.message);});
    })
    .catch((error) => {console.log('error with businessNetworkConnection', error); res.send(error.message);});
};

/**
 * get Historian Records
 * @param {express.req} req - the inbound request object from the client
 *  req.body.registry: _string - type of registry to search; e.g. 'Buyer', 'Seller', etc.
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} an array of members
 * @function
 */
exports.getHistory = function(req, res, next) {
    let allHistory = new Array();
    let businessNetworkConnection;
    let ser;
    let archiveFile = fs.readFileSync(path.join(path.dirname(require.main.filename),'network','dist','zerotoblockchain-network.bna'));
    return BusinessNetworkDefinition.fromArchive(archiveFile)
    .then((bnd) => {
        ser = bnd.getSerializer();
        businessNetworkConnection = new BusinessNetworkConnection();
        // connection prior to V0.15
        // return businessNetworkConnection.connect(config.composer.connectionProfile, config.composer.network, config.composer.adminID, config.composer.adminPW)
        // connection in v0.15
        return businessNetworkConnection.connect(config.composer.adminCard)
            .then(() => {
                return businessNetworkConnection.getRegistry('org.hyperledger.composer.system.HistorianRecord')
                .then(function(registry){
                    return registry.getAll()
                    .then ((history) => {
                        for (let each in history)
                            { (function (_idx, _arr)
                                { let _jsn = _arr[_idx];
                                allHistory.push(ser.toJSON(_jsn));
                            })(each, history);
                        }
                        res.send({'result': 'success', 'history': allHistory});
                    })
                    .catch((error) => {console.log('error with getAll History', error);});
                })
                .catch((error) => {console.log('error with getRegistry', error);});
            })
            .catch((error) => {console.log('error with business network Connect', error);});
    })
    .catch((error) => {console.log('error with admin network Connect', error);});
};
