const router = require("express").Router();
const user = require("../model/User");
const PokemonCard = require("../model/PokemonCard");
const verify = require("./verifyToken");
const multer = require("multer");
const mongoose = require("mongoose");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

/*
Post route that creates a new pokemon card. Requires a name, price, description, and an image file
Sends back a json of the newly created pokemon card
*/
router.post(
  "/",
  verify,
  upload.single("productImage"),
  async (req, res, next) => {
    const pokemonCard = new PokemonCard({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      productImage: req.file.path,
      user: req.user._id,
    });
    await pokemonCard
      .save()
      .then((result) => {
        console.log(result);
        res.status(201).json({
          message: "Handling POST request",
          createdProduct: {
            name: result.name,
            price: result.price,
            productImage: result.productImage,
            user: result.user,
            description: result.description,
            dateAcquired: result.dateAcquired,
            _id: result._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/pokemoncards/" + result._id,
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(404).json({
          error: err,
        });
      });
  }
);

/*
Get route that sends back a json of the requested pokemon card. Requires the object id of the pokemon card
*/

router.get("/:pokemoncardId", verify, async (req, res, next) => {
  const id = req.params.pokemoncardId;
  await PokemonCard.findById(id)
    .select("-__v")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "No entry found for provided id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ error: err });
    });
});


/*
Get route that sends back a json of all the pokemon cards that have that specific name. 
*/

router.get("/searchbyname/:name", verify, async (req, res, next) => {
  await PokemonCard.find()
    .where("name")
    .equals(req.params.name)
    .select("-__v")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        pokemonCards: doc.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            user: doc.user,
            description: doc.description,
            dateAcquired: doc.dateAcquired,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/pokemoncards/" + doc._id,
            },
          };
        }),
      };

      if (doc.length != 0) {
        res.status(200).json(response);
      } else {
        res
          .status(404)
          .json({ message: "No cards found for provided pokemon name" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ error: err });
    });
});

/*
Get route that sends back a json of all the pokemon cards in the database, sorted by the provided field, Must also include a parameter for sorting order
in the body. 1 for sorting in decending order, and -1 for sorting in ascending order.
*/


router.get("/sortbyfield/:field", verify, async (req, res, next) => {
  // check if valid sorting paramater
  if (Math.abs(req.body.order) != 1) {
    res.status(400).json({ message: "Invalid sorting paramater" });
  }
  await PokemonCard.find()
    .sort([[req.params.field, req.body.order]])
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        pokemonCards: doc.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            user: doc.user,
            description: doc.description,
            dateAcquired: doc.dateAcquired,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/pokemoncards/" + doc._id,
            },
          };
        }),
      };

      if (doc.length != 0) {
        res.status(200).json(response);
      } else {
        res
          .status(404)
          .json({ message: "No cards found for provided pokemon name" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ error: err });
    });
});

/*
Get all pokemon cards that belong to a specific user. Must pass in a valid User object id
*/


router.get("/getusercards/:userId", verify, async (req, res, next) => {
  await PokemonCard.find()
    .where("user")
    .equals(req.params.userId)
    .select("-__v")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        pokemonCards: doc.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            user: doc.user,
            description: doc.description,
            dateAcquired: doc.dateAcquired,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/api/pokemoncards/" + doc._id,
            },
          };
        }),
      };

      if (doc.length != 0) {
        res.status(200).json(response);
      } else {
        res.status(500).json({ message: "No entry found for provided user" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ error: err });
    });
});

/*
Delete route that deletes a pokemon card. Requires its specific object id to delete. Also only the user who created the pokemon card can delete it This route would be used if
the user wants to delete their pokemon card or it is sold successfuly.
*/



router.delete("/:pokemoncardId", verify, async (req, res, next) => {
  const id = req.params.pokemoncardId;
  await PokemonCard.findById(id, async function (err, doc) {
    if (err) {
      res.status(404).json({ error: err });
    } else {
      if (req.user._id === doc.user) {
        await PokemonCard.remove({ _id: id })
          .exec()
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((err) => {
            console.log(err);
            res.status(404).json({ error: err });
          });
      } else {
        res.status(403).json({ message: "Access forbidden" });
      }
    }
  });
});


/*
Patch route that modifies a pokemon card. Requires its specific object id to edit . Also only the user who created the pokemon card can edit it.
*/

router.patch("/:pokemoncardId", verify, async (req, res, next) => {
  const id = req.params.pokemoncardId;

  await PokemonCard.findById(id, async function (err, doc) { 
    if (err) {
      res.status(404).json({ error: err });
    } else {
      if (req.user._id == doc.user) {
        await PokemonCard.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true }
        )
          .exec()
          .then((result) => {
            res.status(200).json({
              result: {
                name: result.name,
                price: result.price,
                productImage: result.productImage,
                user: result.user,
                description: result.description,
                dateAcquired: result.dateAcquired,
                _id: result._id,
                request: {
                  type: "GET",
                  url: "http://localhost:3000/api/pokemoncards/" + result._id,
                },
              },
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(404).json({ error: err });
          });
      } else {
        res.status(403).json({ message: "Access forbidden" });
      }
    }
  });
});

module.exports = router;
