const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { bookmarks } = require('../store')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res
            .json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, link, description, rating, bookmarkIds = [] } = req.body;

        if (!title) {
            logger.error(`Title is required`);
            return res
              .status(400)
              .send('Invalid data');
          }
        
        if (bookmarkIds.length > 0) {
            let valid = true;
            bookmarkIds.forEach(bid => {
                const bookmark = bookmarks.find(b => b.id == bid);
                if (!bookmark) {
                logger.error(`Card with id ${bid} not found in bookmarks array.`);
                valid = false;
                }
            });
        
            if (!valid) {
                return res
                .status(400)
                .send('Invalid data');
            }
        }
        const id = uuid();
  
        const bookmark = {
            id,
            title,
            link,
            description,
            rating
        };
  
        bookmarks.push(bookmark);
  
    logger.info(`Bookmark with id ${id} created`);
  
    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${id}`)
      .json({id});

    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(bk => bk.id == id);
      
        // make sure we found a list
        if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res
            .status(404)
            .send('Bookmark Not Found');
        }
      
        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;
  
        const bookmarkIndex = bookmarks.findIndex(bk => bk.id == id);
  
        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Not Found');
        }
  
        bookmarks.splice(bookmarkIndex, 1);
  
        logger.info(`Bookmark with id ${id} deleted.`);
        res
            .status(204)
            .end();
    })

module.exports = bookmarkRouter