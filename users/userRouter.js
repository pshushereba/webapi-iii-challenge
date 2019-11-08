const express = require('express');
const db = require('./userDb.js');
const postDb = require('../posts/postDb.js');

const router = express.Router();

router.post('/', validateUser, (req, res) => {
    const userInfo = req.body;
    
    db.insert(userInfo)
        .then((user) => {
            res.status(201).json(user);
        })
        .catch(() => {
            res.status(500).json({ message: "Error creating new user" });
        });
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
    const postInfo = req.body;
    postInfo.user_id = req.params.id;

    postDb.insert(postInfo)
        .then((id) => {
            postDb.getById(id)
                .then((newPost) => {
                    res.status(201).json(newPost)
                })
                .catch(() => {
                    res.status(500).json({ error: "There was an error while saving the post to the database" })
                })
        })
});

router.get('/', (req, res) => {
    db.get()
        .then((users) => {
            res.status(200).json(users)
        })
        .catch(() => {
            res.status(500).json({message: "The users could not be retrieved."})
        })
});

router.get('/:id', validateUserId, (req, res) => {
    res.status(200).json(req.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
    db.getUserPosts(req.params.id)
            .then((posts) => {
                res.status(200).json(posts)
            })
            .catch(() => {
                res.status(500).json({ message: "Error retrieving user posts." })
            })
});

router.delete('/:id', validateUserId, (req, res) => {
    db.remove(req.params.id)
        .then(() => {
            res.status(204).end();
        })
        .catch(() => {
            res.status(500).json({ message: "Error deleting user" });
        });
});

router.put('/:id', validateUserId, validateUser, (req, res) => {
    const updatedUser = req.body;
    db.update(req.params.id, updatedUser)
      .then(() => {
        db.getById(req.params.id)
          .then(user => {
            res.status(201).json(user);
          })
          .catch(() => {
            res
              .status(500)
              .json({ message: "Error retrieving updated user file" });
          });
      })
      .catch(() => {
        res.status(500).json({ message: "Error updating user" });
      });
});

//custom middleware

function validateUserId(req, res, next) {
    const {id} = req.params;
    
    db.getById(id)
        .then((user) => {
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(404).json({ message: "invalid user id" })
            }
        })
        .catch(() => {
            res.status(500).json({ error: "The user information could not be retrieved." })
        })
};

function validateUser(req, res, next) {
    const body = req.body;
    if(Object.entries(body).length === 0) {
        res.status(400).json({ message: "missing user data" })
    } else if (body.name === undefined) {
        res.status(400).json({ message: "missing required name field" })
    } else {
        next();
    }
};

function validatePost(req, res, next) {
    const body = req.body;
    if(Object.entries(body).length === 0) {
        res.status(400).json({ message: "missing post data" })
    } else if (body.text === undefined) {
        res.status(400).json({ message: "missing required text field" })
    } else {
        next();
    }
};

module.exports = router;
