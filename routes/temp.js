var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var fs = require('fs')
var ejs = require('ejs')
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended:false}))

router.get("/parsing/:cur", function(req, res) {

	console.log('parsing/');
	//페이지 당 게시물 수 : 한 페이지 당 10개
	var page_size = 10;
	//페이지 갯수 : 1~10개 페이
	var page_list_size = 10;
	// limit var
	var no = "";
	//전체 게시물 숫자
	var totalPageCount = 0;

	var queryString = 'select count(*) as cnt from products'
	getConnection().query(queryString, function (error2, data){
		if(error2){
			console.log(error2 + "mysql fail on main view");
			return ;
		}

		//전체 게시물 숫자
		totalPageCount = data[0].cnt

		//현재 페이지
		var curPage = req.params.cur;
		
		console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);

		//전체 ㅇ페이지 갯수
		if(totalPageCount < 0){
			totalPageCount =0;
		}

		var totalPage = Math.ceil(totalPageCount / page_size);		//	전체페이지 수		 var totalSet = Math.ceil(totalPage / page_list_size);	//전체 세트 수
		var curSet = Math.ceil(curPage / page_list_size)	//현재 세트 번호
		var startPage = ((curSet - 1) * 10) +1 // 현재 세트 내 출력될 시작 페이지
		var endPage = (startPage + page_list_size) -1; //현재 세트내 출력될 마지막 페이지
		if(curPage < 0){
			no = 0
		} else{
			no = (curPage -1) * 10
		}

		var result2 = {
			"curPage" : curPage,
			"page_list_size" : page_list_size,
			"page_size" : page_size,
			"totalPage" : totalPage,
			"totalSet" : totalSet,
			"curSet": curSet,
			"startPage" : startPage,
			"endPage" : endPage
		};

		fs.readFile('list.html', 'utf-8', function(error, data){
			if(error){
				console.log("ejs error"  + error);
				return
			}
			console.log("몇번부터 몇번까지냐~~" + no)

			var queryString = 'select * from products order by id des limit ?,?';
			getConnetion().query(queryString, [no, page_size], function(error, result){
				if(error){
					console.log("페이징 에러" + error);
					return
				}
				res.send(ejs.render(data,{
					data: result,
					pasing: result2
				}));
			});
		});
	})
})

// Main View
router.get("/main", function(req,res){
	console.log("Main view")
	//메인으로 들어오면 바로 페이징 처리
	res.redirect('/pasing/' + 1)
});

// delete
router.get("/delete/:id", function(req,res){
	console.log("Delete Precess")

	getConnection().query('delete from products where id = ?',[req.params.id],function(){
		res.redirect('/main')
	});
})

// Insert Page
router.get("/insert", function(req,res){
	console.log("Insert Page")
	
	fs.readFile('insert.html', 'utf-8', function(error, data){
		res.send(data)
	})
})

// Insert Poster data
router.post("/insert", function(req,res){
	console.log("Insert Post data process")
	var body = req.body;
	getConnection().query('insert into products(name,modelnumber,series) values (?,?,?)', [body.name, body.num, body.section], function () {
		res.redirect('main');
	})
})

// Modify Page
router.get("/edit/:id", function(req,res) {
	console.log("Modification Process")
	
	fs.readFile('edit.html', 'utf-8', function(error, data){
			getConnection().query('select * from products where id = ?', [req.params.id], function (error, result) {
			res.send(ejs.render(data, {
				data: result[0]
			}))
		})
	});
})

// Modify Poster data
router.post("/edit/:id", function(req,res){
	console.log("Modification Post Process")
	var body = req.body;
	getConnection().query('update products set name = ?, modelnumber = ?, series = ? where id = ?',[body.name, body.num, body.section, req.params.id], function(){
			res.redirect('/main')
		})
})

// Detail Page
router.get("/detail/:id", function(req,res){
	console.log("Detail page")

	fs.readFile('detail.html','utf-8', function(error, data){
		getConnection.query('select * from products where id = ?', [req.params.id], 
			function(error, result){
				res.send(ejs.render(data,{
					data:result[0]
				}))
			})
		});
})

// mysql db connection
var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'root',
	database: ' Threel',
	password: '1111'
})

// DB connection
function getConnection(){
	return pool
}

module.exports = router
