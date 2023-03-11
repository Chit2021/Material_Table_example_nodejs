const express = require('express');
const app = express();
const connection = require('./connection');
const bodyParser = require('body-parser');
const morgan = require('morgan');

//use middleware

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(morgan(':method :url :response-time'));
// app.use(cors());
// app.use(cors({

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", '*');
	res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "*");
	next();
});

//route handlers
app.get('/user',(req,res)=>{
res.send("Done");
})

// app.get("/user", function (req, res) {
//     res.status(200).json({ Success: true, Message: "Welcome Hello "});
// });

app.post('/', async (req, res) => {
	console.log(req.body)
	return res.send([{id:1,name:"ccc",surname:"aaa",course:"c",email:"a@gmail.com"}]);
	try {
		let query = '';
		query = `SELECT * FROM usertable  WHERE 1=1`;
		return res.send(query);

	} catch (error) {
		console.log(error);
		res.status(500).send(processStatus("failed", 'Something went wrong 1', null, error.error));
	}
})

async function getStudents(req,res) {
    try {
        
        await mssql.connect(sqlConfig)
        
        const result = await mssql.query`select * from Students2`
        // console.log(result)
        res.send(result)
    } catch (error) {
        res.send(error);
    }
}

app.get('/getalldata', async (req, res) => {
	try {
		console.log('bodyData', req.body);
		let query = '';
		query = `SELECT * FROM usertable`;
		console.log(query);
		let userDataPromise = new Promise((resolve, reject) => {
			connection.query(query, (error, result) => {
				if (error) {
					// console.error(error);
					reject(error);
				} else {
					resolve(result.rows);
				}
			})
		})
	
		let totalRecordCountPromise = new Promise((resolve, reject) => {
			connection.query(`SELECT count(*) count FROM usertable `, (error, totalRecordcountResult) => {
				if (error) {
					reject(error)
				} else {
					resolve(totalRecordcountResult.rows)
				}
			})

		})

		Promise.all([userDataPromise, totalRecordCountPromise]).then((response) => {
			response[0].map((element, index) => element['index'] = index + 1);
			let userData = {};
			userData['data'] = response[0];
			userData['recordsFiltered'] = response[0].length;
			userData['recordsTotal'] = response[1][0].count;
			return res.send(userData);
		})
	} catch (error) {
		console.log(error);
		res.status(500).send(processStatus("failed", 'Something went wrong', null, error.error));
	}
})

app.post('/', async (req, res) => {
	try {
		console.log('bodyData', req.body);
		let orderBy = req.body.order[0].column == 0 ? 'id' : req.body.columns[req.body.order[0].column].data;
		//let orderBy = req.body.order[0].column;
		let orderType = req.body.order[0].dir;
		let searchVal = req.body.search.value;
		let startIndex = req.body.start;
		let offset = req.body.length;

		// let name = req.body.name;
		// let surname = req.body.surname;

		let query = '';

		query = `SELECT * FROM usertable  WHERE 1=1`;

		if (searchVal) {
			query += `AND (name like '%${searchVal}%' OR surname like '%${searchVal}%' OR course like '%${searchVal}%'OR email like '%${searchVal}%') `
		}
		query += `order by ${orderBy} ${orderType} limit ${offset} OFFSET ${startIndex}`;
		console.log(query);

		let userDataPromise = new Promise((resolve, reject) => {
			connection.query(query, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result.rows);
				}
			})
		})
	
		let totalRecordCountPromise = new Promise((resolve, reject) => {
			connection.query(`SELECT count(*) count FROM usertable `, (error, totalRecordcountResult) => {
				if (error) {
					reject(error)
				} else {
					resolve(totalRecordcountResult.rows)
				}
			})

		})

		Promise.all([userDataPromise, totalRecordCountPromise]).then((response) => {
			response[0].map((element, index) => element['index'] = index + 1);
			let userData = {};
			userData['data'] = response[0];
			userData['recordsFiltered'] = response[0].length;
			userData['recordsTotal'] = response[1][0].count;
			return res.send(userData);
		})
	} catch (error) {
		console.log(error);
		res.status(500).send(processStatus("failed", 'Something went wrong', null, error.error));
	}
})

app.post('/addUpdateUser', async (req, res) => {
	try {
		if (req.body.name && req.body.surname && req.body.course && req.body.email) {
			if (req.body.id == 0) {
				delete req.body.id;
				await addUser(req.body);
				return res.status(200).send(processStatus("success", "User was added succesffully", null));

			} else {
				let userId = req.body.id;
				delete req.body.id;
				await updateUser(req.body, userId);
				return res.status(200).send(processStatus("success", "User was updated succesffully", null));
			}
		} else {
			res.status(422).send(processStatus("failed", "Validation Error", null));
		}
	} catch (error) {
		console.log('error', error);
		res.status(500).send(processStatus("failed", 'Something went wrong', null, error));
	}

})

app.delete('/deleteUser/:id', async (req, res) => {
	try {
		let userId = req.params.id;
		await deleteUser(userId);
		res.status(200).send(processStatus("success", 'User was deleted successfully', null, null))
	} catch (error) {
		console.log('error', error);
		res.status(500).send(processStatus("failed", 'Something went wrong', null, error));
	}
})


app.listen(3003, () => console.log("Server listening on port 3003"));

//old code 
// function addUser(data) {
// 	return new Promise((resolve, reject) => {
// 		connection.query(`INSERT INTO newuser set ? `, data, (err, status) => {
// 			if (err) {
// 				console.log(err);
// 				reject(err);
// 			} else {
// 				resolve(status);
// 			}
// 		})
// 	})
// }

//updated by me
const addUser = async (data) => {
    try {
      const { name, surname, course, email} = data
      let results = await connection.query('INSERT INTO usertable (name, surname,course,email) VALUES ($1, $2, $3, $4)', [name, surname, course,email]) 
     } catch (error) {
    //   response.status(500).send("Server error")
	throw new Error(error)
    }
   
  }
// original update code edited for postgres

function updateUser(data, userId) {
	const { name, surname, course, email} = data
	return new Promise((resolve, reject) => {
		//connection.query(`UPDATE newuser set ? where id = ${userId}`, data, (error, status) => {
		connection.query(`UPDATE usertable SET name =($1), surname =($2), course =($3),email =($4) WHERE id = ${userId}`, [name, surname, course,email], (error, status) => {
			if (error) {
				reject(error);
			} else {
				resolve(status);
			}
		// }
	})
})
}

function getalldata() {
	// const { name, surname, course, email} = data
	return new Promise((resolve, reject) => {
		
		connection.query(`SELECT * FROM usertable`,(error, status) => {
			if (error) {
				reject(error);
			} else {
				resolve(status);
			}
		// }
	})
})
}



// by me
// const updateUser = async (data, userId) => {
//     try {
// 		const {name, phone, email, course } = data
  
// 		let results = connection.query(`UPDATE newuser SET name = ($1), phone = ($2), email = ($3), course = ($4) WHERE id = ${userId}`, [dname, phone, email, course]) 
// 		console.log("UPDATE:Updated user having id is",userId)
// 	} catch (error) {
// 		throw new Error(error)
// 	}
        
// }
    
// deletes user
function deleteUser(userId) {
	return new Promise((resolve, reject) => {
		// connection.query(`DELETE FROM newuser where id =?`, userId, (err, status) => {      old code
		connection.query(`DELETE FROM usertable where id =$1`, [userId], (err, status) => {
			if (err) {
				reject(err)
			} else {
				console.log("Deleted");
				resolve(status)
			}
		})
	})
}


function processStatus(status, msg, data, err) {
	if (status == 'success') {
		return { success: true, msg: msg, data: data, error: null }
	} else {
		return { success: false, msg: msg, data: null, error: err };
	}
}