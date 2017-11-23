/**
 * Created by jaehong on 2017. 11. 24..
 */
const express = require('express');

const router = express.Router();

// 모든 유저 정보
router.get('/', function (req, res) {
  res.send('express works');
});

module.exports = router;