/**
 * Created by jaehong on 2017. 11. 27..
 */
const express = require('express');
const server = require('../../server');

const router = express.Router();

// 모든 방 정보
router.get('/', (req, res) => {
  res.json({ result: server.rooms });
});

router.post('/', (req, res) => {
  server.rooms.push(req.body.data);
  res.json({ result: 'ok'});
})

router.get('/:id', (req, res) => {
  res.json({id: req.params.id })

})

module.exports = router;

