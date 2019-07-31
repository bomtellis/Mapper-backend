var express = require('express');
var adminRoutes = express.Router();
const { isAdmin} = require('../handlers/authenticate');

// handler
const Admin = require('../handlers/admin');
const User = require('../models/user');
const Token = require('../models/tabletToken');
const cache = require('../handlers/redis');

var mongoose = require('mongoose');

adminRoutes.get('/', function(req, res) {
	res.json({ "message": "Admin subroute works" });
});

adminRoutes.get('/stats', isAdmin, cache.route({ expire: 300 }), function(req, res) {
	// cached for 5 mins
	Admin.stats()
		.then(function(data) {
				res.status(200);
				res.json(data);
			},
			function() {
				res.status(500);
				res.json({
					message: "Error"
				});
			});
});

adminRoutes.get('/users', isAdmin, function(req, res) {
	Admin.users()
		.then(function(data) {
				res.status(200);
				res.json(data);
			},
			function(err) {
				throw err;
				res.status(500);
				res.json({
					message: "Error"
				})
			});
});

adminRoutes.get('/keys', isAdmin, cache.route({ expire: 15 }), function(req, res) {
	Admin.keys()
		.then(function(data) {
				res.status(200);
				res.json(data);
			},
			function(err) {
				throw err;
				res.status(500);
				res.json({
					message: "Error"
				})
			});
})

adminRoutes.post('/user/create', isAdmin, function(req, res) {
	Admin.createUser(req.body)
		.then(function() {
				res.status(200);
				res.json({
					message: "Success"
				})
			},
			function(err) {
				res.status(500);
				res.json({
					message: "Error",
					error: err
				})
			})
});

adminRoutes.get('/user/:id', isAdmin, function(req, res) {
	if (req.params.id) {
		// regex objectid style
		if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			try {
				var id = mongoose.Types.ObjectId(req.params.id);
			} catch (e) {
				res.status(400);
				res.json({
					error: {
						name: "Bad ID",
						message: "ID has been provided in an incorrect format"
					}
				});
			} finally {
				User.findById(id, function(err, user) {
					if (err) {
						res.status(500);
						res.json({
							error: {
								name: "Server Error",
								message: "The Database has a problem finding that record"
							}
						});
					}

					if (user) {
						res.status(200);
						res.json(user);
					} else {
						res.status(404);
						res.json({
							error: {
								name: "Not Found",
								message: "Unable to find that user"
							}
						})
					}
				})
			}

		} else {
			res.status(400);
			res.json({
				error: {
					name: "Bad Request",
					message: "No id has been requested"
				}
			})
		}
	} else {
		res.status(400);
		res.json({
			error: {
				name: "Bad Request",
				message: "No id has been requested"
			}
		})
	}
});

adminRoutes.post('/user/changeRole', isAdmin, function(req, res) {
	try {
		if (req.body.id && req.body.role) {
			// id regex
			if (req.body.id.match(/^[0-9a-fA-F]{24}$/)) {
				if (req.body.role.match(/^[0-3]$/)) {
					try {
						var id = mongoose.Types.ObjectId(req.body.id);
					} catch (e) {
						res.status(400);
						res.json({
							error: {
								name: "Bad ID",
								message: "Id is not acceptable"
							}
						})
					} finally {
						User.findByIdAndUpdate(id, { $set: { "role": req.body.role } }, function(err, user) {
							if (err) {
								res.status(500);
								res.json({
									error: {
										name: "Server Error",
										message: "The Server cannot find that record"
									}
								});
							}

							if (user) {
								res.status(200);
								res.json({
									success: {
										name: "Modified User",
										message: "Altered user role successfully"
									}
								})
							} else {
								res.status(404);
								res.json({
									error: {
										name: "Not Found",
										message: "User not found in database"
									}
								})
							}
						})
					}
				} else {
					res.status(400);
					res.json({
						error: {
							name: "Bad Role",
							message: "Role is not within predefined list"
						}
					});
				}
			} else {
				res.status(400);
				res.json({
					error: {
						name: "Bad request",
						message: "Bad id sent"
					}
				})
			}
		} else {
			res.status(400);
			res.json({
				error: {
					name: "Bad request",
					message: "No id or role sent to server"
				}
			})
		}
	} catch (e) {
		res.status(500);
		res.json({
			error: {
				name: "Server Error",
				message: "Unable to process request"
			}
		})
	}
});

adminRoutes.post('/user/changePassword', isAdmin, function(req, res) {
	try {
		if (req.body.id && req.body.password) {
			// id regex
			if (req.body.id.match(/^[0-9a-fA-F]{24}$/)) {
				if (req.body.password.match(/^.{8,}$/)) {
					try {
						var id = mongoose.Types.ObjectId(req.body.id);
					} catch (e) {
						res.status(400);
						res.json({
							error: {
								name: "Bad ID",
								message: "Id is not acceptable"
							}
						})
					} finally {
						User.findById(id, function(err, user) {
							if (err) {
								res.status(500);
								res.json({
									error: {
										name: "Server Error",
										message: "The Server cannot find that record"
									}
								});
							}

							if (user) {
								user.setPassword(req.body.password, function() {
									user.save();
									res.status(200);
									res.json({
										success: {
											name: "Modifed User",
											message: "Changed user password successfully"
										}
									})
								});
							} else {
								res.status(404);
								res.json({
									error: {
										name: "Not Found",
										message: "User not found in database"
									}
								})
							}
						})
					}
				} else {
					res.status(400);
					res.json({
						error: {
							name: "Bad Password",
							message: "Password cannot be blank"
						}
					});
				}
			} else {
				res.status(400);
				res.json({
					error: {
						name: "Bad request",
						message: "Bad id sent"
					}
				})
			}
		} else {
			res.status(400);
			res.json({
				error: {
					name: "Bad request",
					message: "No id or password sent to server"
				}
			})
		}
	} catch (e) {
		res.status(500);
		res.json({
			error: {
				name: "Server Error",
				message: "Unable to process request"
			}
		})
	}
});

adminRoutes.post('/user/toggleActive/:id', isAdmin, function(req, res) {
	try {
		if (req.params.id) {
			// id regex
            if(typeof req.body.active === "boolean")
            {
                if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    				try {
    					var id = mongoose.Types.ObjectId(req.params.id);
    				} catch (e) {
    					res.status(400);
    					res.json({
    						error: {
    							name: "Bad ID",
    							message: "Id is not acceptable"
    						}
    					})
    				} finally {
    					User.findByIdAndUpdate(id, { $set: { active: req.body.active } }, function(err, user) {
    						if (err) {
    							res.status(500);
    							res.json({
    								error: {
    									name: "Server Error",
    									message: "The Server cannot find that record"
    								}
    							});
    						}

    						if (user) {
    							res.status(200);
    							res.json({
    								success: {
    									name: "Modified User",
    									message: "Altered user role successfully"
    								}
    							})
    						} else {
    							res.status(404);
    							res.json({
    								error: {
    									name: "Not Found",
    									message: "User not found in database"
    								}
    							})
    						}
    					})
    				}
    			} else {
    				res.status(400);
    				res.json({
    					error: {
    						name: "Bad request",
    						message: "No id or role sent to server"
    					}
    				})
    			}
            }
            else
            {
                res.status(400);
                res.json({
                    error: {
                        name: "Bad request",
                        message: "Active must be true or false"
                    }
                });
            }

		}
        else
        {
            res.status(400);
            res.json({
                error: {
                    name: "Bad request",
                    message: "No id send"
                }
            })
        }
	} catch (e) {
		res.status(500);
		res.json({
			error: {
				name: "Server Error",
				message: "Unable to process request"
			}
		})
	}
});

adminRoutes.get('/user/delete/:id', isAdmin, function(req, res)
{
    try {
		if (req.params.id) {
			// id regex
			if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
				try {
					var id = mongoose.Types.ObjectId(req.params.id);
				} catch (e) {
					res.status(400);
					res.json({
						error: {
							name: "Bad ID",
							message: "Id is not acceptable"
						}
					})
				} finally {
					User.findByIdAndDelete(id, function(err, user) {
						if (err) {
							res.status(500);
							res.json({
								error: {
									name: "Server Error",
									message: "The Server cannot find that record"
								}
							});
						}

						if (user) {
							res.status(200);
							res.json({
								success: {
									name: "Modified User",
									message: "Deleted user successfully"
								}
							})
						} else {
							res.status(404);
							res.json({
								error: {
									name: "Not Found",
									message: "User not found in database"
								}
							})
						}
					})
				}
			} else {
				res.status(400);
				res.json({
					error: {
						name: "Bad request",
						message: "No id sent to server"
					}
				})
			}
		}
	} catch (e) {
		res.status(500);
		res.json({
			error: {
				name: "Server Error",
				message: "Unable to process request"
			}
		})
	}
});

adminRoutes.post('/revokeToken', isAdmin, function(req, res)
{
	try {
		if(req.body.id)
		{
			if(req.body.id.match(/^[0-9a-fA-F]{24}$/))
			{
				// id regex
				try {
					var id = mongoose.Types.ObjectId(req.body.id);
				} catch (e) {
					res.status(400);
					res.json({
						error: {
							name: "Bad ID",
							message: "Id is not acceptable"
						}
					})
				} finally {
					Token.findByIdAndRemove(id, function(err, token)
					{
						if(err)
						{
							res.status(500);
							res.json({
								error: {
									name: "Server Error",
									message: "Could not revoke token"
								}
							});
						}

						if(token)
						{
							User.findOneAndUpdate({tokenId: token._id}, {$unset: {tokenId: 1} }, function(err, user)
							{
								if(err)
								{
									res.status(500);
									res.json({
										error: {
											name: "Server Error",
											message: "Could not revoke token"
										}
									});
								}

								res.status(200);
								res.json({
									success: {
										name: "Modifed Token",
										message: "Revoked token successfully"
									}
								})
							})

						}
						else
						{
							res.status(400);
							res.json({
								error: {
									name: "Not Found",
									message: "Token not found"
								}
							})
						}
					});
				}
			}
			else
			{
				res.status(400);
				res.json({
					error: {
						name: "Bad Id",
						message: "Id is not valid"
					}
				})
			}
		}
	} catch (e) {
		res.status(400);
		res.json({
			error: {
				name: "Server Error",
				message: "Unable to process request"
			}
		})
	}
});

// export the routes
module.exports = adminRoutes;
