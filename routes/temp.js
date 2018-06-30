var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var fs = require('fs')
var ejs = require('ejs')
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended:false}))

router.get("/parsing/:cur", function(req, res) {

	console.log('parsing/');
	//������ �� �Խù� �� : �� ������ �� 10��
	var page_size = 10;
	//������ ���� : 1~10�� ����
	var page_list_size = 10;
	// limit var
	var no = "";
	//��ü �Խù� ����
	var totalPageCount = 0;

	var queryString = 'select count(*) as cnt from products'
	getConnection().query(queryString, function (error2, data){
		if(error2){
			console.log(error2 + "mysql fail on main view");
			return ;
		}

		//��ü �Խù� ����
		totalPageCount = data[0].cnt

		//���� ������
		var curPage = req.params.cur;
		
		console.log("���� ������ : " + curPage, "��ü ������ : " + totalPageCount);

		//��ü �������� ����
		if(totalPageCount < 0){
			totalPageCount =0;
		}

		var totalPage = Math.ceil(totalPageCount / page_size);		//	��ü������ ��		 var totalSet = Math.ceil(totalPage / page_list_size);	//��ü ��Ʈ ��
		var curSet = Math.ceil(curPage / page_list_size)	//���� ��Ʈ ��ȣ
		var startPage = ((curSet - 1) * 10) +1 // ���� ��Ʈ �� ��µ� ���� ������
		var endPage = (startPage + page_list_size) -1; //���� ��Ʈ�� ��µ� ������ ������
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
			console.log("������� ���������~~" + no)

			var queryString = 'select * from products order by id des limit ?,?';
			getConnetion().query(queryString, [no, page_size], function(error, result){
				if(error){
					console.log("����¡ ����" + error);
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
	//�������� ������ �ٷ� ����¡ ó��
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
