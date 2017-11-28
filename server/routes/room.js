/**
 * Created by jaehong on 2017. 11. 27..
 */
const express = require('express');
const server = require('../../server');

const router = express.Router();

// 모든 방 정보
router.get('/', (req, res) => {
  console.log('in routes', server.rooms);
  res.json({ result: server.rooms });
});

router.get('/:id', (req, res) => {
  res.json({id: req.params.id })
})

module.exports = router;