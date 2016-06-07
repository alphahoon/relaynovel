var db = require('./database.js');
var moment = require('moment');

//cberror : function(err)
//cbsuccess : function()
function joinGroup(groupname, userid, iswriter, cberror, cbsuccess) {
    var delwriter = iswriter?'+1':'+0';
    var delreader = '+1';
    db.connection.query('insert into JoinGroup set Groupname = '
        + db.mysql.escape(groupname)
        + ', isWriter = ' + iswriter + ', userid = '
        + db.mysql.escape(userid),
        function (err) {
            if (err) cberror(err);
            else setWritersReaders(groupname, delwriter, delreader,
                function (err) {
                    cberror(err);
                }, function () {
                    cbsuccess();
                });
        });
}

function beWriter(groupname, userid, cberror, cbsuccess) {
    db.connection.query('update JoinGroup set isWriter = true where Groupname = '
        + db.mysql.escape(groupname)
        + ' and userid = '
        + db.mysql.escape(userid),
        function (err) {
            if (err) cberror(err);
            else setWritersReaders(groupname, '+1', '+0',
                function (err) {
                    cberror(err);
                }, function () {
                    cbsuccess();
                });
        });
}
function beReader(groupname, userid, cberror, cbsuccess) {
    db.connection.query('update JoinGroup set isWriter = false where Groupname = '
        + db.mysql.escape(groupname)
        + ' and userid = '
        + db.mysql.escape(userid),
        function (err) {
            if (err) cberror(err);
            else setWritersReaders(groupname, '-1', '+0',
                function (err) {
                    cberror(err);
                }, function () {
                    cbsuccess();
                });
        });
}
function exitGroup(groupname, userid, cberror, cbsuccess) {
    db.connection.query('select isWriter from JoinGroup where Groupname = '
        + db.mysql.escape(groupname)
        + ' and userid = '
        + db.mysql.escape(userid),
        function(err, rows) {
            if (rows) {
                var delwriter = rows[0].isWriter ? '-1' : '+0';

                db.connection.query('delete from JoinGroup where Groupname = '
                    + db.mysql.escape(groupname)
                    + ' and userid = '
                    + db.mysql.escape(userid),
                    function(err) {
                        if (err) cberror(err);
                        else setWritersReaders(groupname, delwriter, '-1',
                            function(err) {
                                cberror(err);
                            }, function() {
                                cbsuccess();
                            });
                    });
            }
        });
}
function quitForever(userid, cberror, cbsuccess) {
    db.connection.query('delete from User where userid = '
        + db.mysql.escape(userid),
        function(err) {
            if (err) cberror(err);
            else cbsuccess();
        });
}
function setWritersReaders(groupname, deltawriters, deltareaders, cberror, cbsuccess) {
    db.connection.query('update RenoGroup '
        + 'set writers = writers' + deltawriters
        + ', readers = readers' + deltareaders
        + ' where Groupname = '
        + db.mysql.escape(groupname),
        function (err) {
            if (err) cberror(err);
            else cbsuccess();
        });
}

function getCurrentNode(groupname, cberror, cbsuccess) {
    db.connection.query('select CurrentNode from RenoGroup where Groupname=' + db.mysql.escape(groupname),
        function (err, curr_node) {
            if (err) cberror(err);
            else if (curr_node[0] == null) cbsuccess(null);
            else cbsuccess(curr_node[0].CurrentNode);
        });    
}

function getRevision(groupname, cberror, cbsuccess) {
    db.connection.query('select count(Groupname) AS revision from Node where Groupname = ' + db.mysql.escape(groupname),
        function (err, revision_number) {
            if (err) cberror(err);            
            else cbsuccess(revision_number[0].revision);
        });    
}

function submitContent(content, writer, groupname, cberror, cbsuccess) {
    getCurrentNode(groupname,
    function (err) {
      console.log('nonexistent group')
    }, function (curr_node) {
        getRevision(groupname,
            function (err) {
            console.log('nonexistent group')
            }, function (revision_number) {
                var nodevalues = {
                    NodeID : groupname + revision_number,
                    revision = revision_number,
                    Groupname : groupname,
                    ParentNode : curr_node,
                    Content : content,
                    vote_status : 'wait',
                    TimeWritten : moment().format('YYYY-MM-DD HH:mm:ss'),
                    writer : writer 
                };
                db.connection.query('insert into Node set ?', nodevalues,
                function (err) {
                    if (err) cberror(err);
                    else {
                        setNewWriter(groupname,
                            function (err) {
                                cberror(err);
                            }, function () {
                                createVote(nodevalues, 'add', null,
                                function (err) {
                                    cberror(err);
                                }, function() {
                                    cbsuccess(nodevalues.NodeID);
                                });
                            });                        
                    }                    
                });
        })
    })    
}

function submitModification (content, nodetomodify, writer, groupname, cberror, cbsuccess) {
    getCurrentNode(groupname,
    function (err) {
      console.log('nonexistent group')
    }, function (curr_node) {
            getRevision(groupname,
            function (err) {
            console.log('nonexistent group')
            }, function (revision_number) {        
            var nodevalues = {
                NodeID : groupname + (10000+revision_number),
                revision : 10000+revision_number,
                Groupname : groupname,
                ParentNode : null,
                Content : content,
                vote_status : 'wait',
                TimeWritten : moment().format('YYYY-MM-DD HH:mm:ss'),
                writer : writer 
            };
            db.connection.query('insert into Node set ?', nodevalues,
            function (err) {
                if (err) cberror(err);
                else {
                    createVote(nodevalues, 'change', nodetomodify,
                    function (err) {
                        cberror(err);
                    }, function() {
                        cbsuccess(nodevalues.NodeID);
                    });                
                }                    
            });       
        }); 
    });    
}

function setNewWriter (groupname, cberror, cbsuccess) {
    db.connection.query("select writer, VoteLimit from RenoGroup where Groupname = " + db.mysql.escape(groupname),
        function (err, group_query) {
            if (err) cberror(err);            
            else {
                db.connection.query("SELECT userid FROM JoinGroup WHERE Groupname=" + db.mysql.escape(groupname)+
                " AND isWriter=1 AND userid != " + db.mysql.escape(group_query[0].writer) + " order by rand() limit 1",
                function (err, writer_2) {
                    if (err) cberror(err);            
                    else {
                        var new_writer;
                        if (writer_2[0] == null) new_writer = group_query[0].writer;
                        else new_writer = writer_2[0].userid;
                        var votelimit = group_query[0].VoteLimit.split(":");
                        for (var i = 0; i < votelimit.length; i++) votelimit[i] = parseInt(votelimit[i], 10);
                        var timeafter = moment().add({ hours: votelimit[0], minutes: votelimit[1], seconds: votelimit[2] }).format('YYYY-MM-DD HH:mm:ss');                        
                        update_groupinfo = {
                            writer : new_writer,
                            writerchanged : 1,
                            writerchangetime :timeafter  
                        };
                        db.connection.query('update RenoGroup set ? where Groupname = '+ db.mysql.escape(groupname), update_groupinfo,
                        function (err) {
                            if (err) cberror(err);
                            else cbsuccess();
                        });
                    }
                });                    
            }
        });        
}

function createVote(nodevalues, votetype, NodetoModify, cberror, cbsuccess) {
    db.connection.query("select count(VoteID) AS counts from Vote", function (err, Votes){
        if (err) cberror(err);  
        else if (Votes==null) cberror(err);            
        else {
            var VoteID = 0;
            if (Votes[0] == null) cberror(err);
            else VoteID = Votes[0].counts + 1;
            console.log(VoteID);
            console.log(Votes[0].counts);
            db.connection.query("select VoteLimit from RenoGroup where Groupname =" + db.mysql.escape(nodevalues.Groupname),
            function (err, votinglimit){
                if (err) cberror(err);
                else{            
                    var start_time = moment();
                    var voteLimit = votinglimit[0].VoteLimit.split(":");
                    for (var i = 0; i < voteLimit.length; i++) voteLimit[i] = parseInt(voteLimit[i], 10);
                    var timeafter = start_time.add({ hours: voteLimit[0], minutes: voteLimit[1], seconds: voteLimit[2] });
                    var votevalues = {
                        VoteID : VoteID,
                        Group_GroupId : nodevalues.Groupname,
                        Votetype : votetype,
                        NodeId : nodevalues.NodeID,
                        StartTime : start_time.format('YYYY-MM-DD HH:mm:ss'),
                        EndTime : timeafter.format('YYYY-MM-DD HH:mm:ss'),
                        VoteStatus : 1,
                        ModifyNode : null
                    };
                    if (votetype == 'change') votevalues.ModifyNode = NodetoModify;
                    console.log(votevalues);
                    db.connection.query('insert into Vote set ?', votevalues, function(err) {
                        if (err) cberror(err);
                        else {
                            console.log('success')
                            setVoteTimer(votevalues.Votetype+votevalues.NodeId, votevalues.VoteID, votevalues.StartTime, votinglimit[0].VoteLimit,
                            function(err) {
                                cberror(err);
                            }, function() {
                                cbsuccess();
                            });                            
                        }
                    });                        
                }
            });
        }        
    })
}

function setWriterTimer(timername, groupcreationtime, writelimit, groupname, cberror, cbsuccess) {
    // writer가 중간에 글을 제출하는 경우, writer 를 다른 멤버로, writerchanged=1,
    // writerchangetime=now()+VoteLimit 으로 바꿔줘야됨
    //timername : string
    //groupcreationtime : datetime
    //writelimit : string (format = '00:00:00')
    //groupname : string
    db.connection.query("CREATE EVENT " + timername +" ON SCHEDULE AT "+
    "(ADDTIME('"+ groupcreationtime + "', '" + writelimit + "')) ON COMPLETION PRESERVE " +
    "DO	BEGIN " +
			"DECLARE writer1 varchar(45);"+
            "DECLARE writer2 varchar(45);"+
            "DECLARE changetime DATETIME;"+
            "DECLARE currenttime DATETIME;"+
            "DECLARE group_name varchar(45);"+
            "SET group_name = '" + groupname + "';"+
            "SET writer1 = (SELECT writer FROM RenoGroup WHERE Groupname=group_name);"+
			"IF ((SELECT writerchanged FROM RenoGroup WHERE Groupname=group_name) = 1) "+
			"THEN "+
				"SET changetime = ADDTIME((SELECT writerchangetime FROM RenoGroup WHERE Groupname=group_name),(SELECT WriteLimit FROM RenoGroup WHERE Groupname=group_name));"+
                "ALTER EVENT " + timername + " ON SCHEDULE AT changetime ENABLE;"+
				"UPDATE RenoGroup SET writerchanged=0 WHERE Groupname=group_name;"+
			"ELSE "+
				"SET currenttime = NOW();"+
				"SET changetime = ADDTIME(currenttime,(SELECT WriteLimit FROM RenoGroup WHERE Groupname=group_name));"+
                "ALTER EVENT " + timername + " ON SCHEDULE AT changetime ENABLE;"+
                "UPDATE RenoGroup SET writerchangetime=currenttime WHERE Groupname=group_name;"+
                "IF ((SELECT count(userid) FROM JoinGroup WHERE Groupname=group_name AND isWriter=1) != 1) "+
                "THEN "+
                    "SET writer2 = (SELECT userid FROM JoinGroup WHERE Groupname=group_name AND isWriter=1 AND userid != writer1 order by rand() limit 1);"+
                "ELSE "+    
                    "SET writer2 = writer1;"+
                "END IF;"+
                "UPDATE RenoGroup SET writer=writer2 WHERE Groupname=group_name;"+
            "END IF;"+
		"END",
        function (err) {
            if (err) cberror(err);
            else cbsuccess();
        }); 
}

function setVoteTimer (timername, VoteID, VoteStart, VoteLimit, cberror, cbsuccess) {
    db.connection.query("CREATE EVENT " + timername + " ON SCHEDULE AT (ADDTIME('" + VoteStart + "', '"+VoteLimit +"')) "+
    "DO BEGIN "+
        "DECLARE vote_type varchar(45);"+
        "DECLARE vote_yes INTEGER;"+
        "DECLARE count_members INTEGER;"+
        "DECLARE current_vote INTEGER;"+
        "DECLARE group_name varchar(45);"+
        "DECLARE current_node varchar(45);"+
        "DECLARE modify_node varchar(45);"+
        "SET current_vote = "+VoteID+";"+
        "SET group_name = (SELECT Group_GroupId FROM Vote where VoteID = current_vote);"+
        "SET count_members = (SELECT Count(*) FROM JoinGroup WHERE Groupname=group_name);"+
        "SET current_node = (SELECT NodeID FROM Vote where VoteID = current_vote);"+
        "SET vote_yes = (Select Count(*) from Voting where Vote_VoteID = current_vote AND Vote_Value='yes');"+
        "SET modify_node = (SELECT ModifyNode FROM Vote where VoteID = current_vote);"+
        "SET vote_type = (SELECT Votetype FROM Vote where VoteID = current_vote);"+
        "update Vote set VoteStatus = 0 where VoteID = current_vote;"+
        "IF (vote_type = 'add') "+
        "THEN "+
            "IF (vote_yes >= count_members*0.5) "+
            "THEN "+					
                "UPDATE RenoGroup set CurrentNode = current_node where Groupname = group_name;"+
                "UPDATE Node set vote_status = 'approve' where NodeID = current_node;"+
            "ELSE "+
                "UPDATE Node set vote_status = 'inactive' where NodeID = current_node;"+
            "END IF;"+
        "ELSEIF (vote_type = 'rollback' or vote_type = 'complete') "+
        "THEN "+
            "IF (vote_yes >= count_members*0.75) "+
            "THEN "+
                "UPDATE RenoGroup set CurrentNode = current_node where Groupname = group_name;"+
                "UPDATE Node set vote_status = 'approve' where NodeID = current_node;"+
                "IF (vote_type = 'complete') "+
                "THEN "+
                    "UPDATE RenoGroup set Finished = 1 where Groupname = group_name;"+
                    "UPDATE Vote SET VoteStatus = 0 where Group_GroupId = group_name;"+
                    "UPDATE RenoGroup set writer = '' where Groupname = group_name;"+
                "END IF;"+
            "ELSE "+
                "UPDATE Node set vote_status = 'inactive' where NodeID = current_node;"+                    
            "END IF;"+
        "ELSEIF (vote_type = 'change') "+
        "THEN "+
            "IF (vote_yes >= count_members/2) "+
            "THEN "+
                "UPDATE Node set Content=(SELECT * FROM (SELECT Content from Node where NodeID=modify_node) Node) where NodeID=current_node;"+
            "END IF;"+
            "DELETE from Node where NodeID=current_node;"+
        "END IF;"+
    "END",
        function (err) {
            if (err) cberror(err);
            else cbsuccess();
        });
}

module.exports = {
    beReader: beReader,
    beWriter: beWriter,
    setWriterTimer : setWriterTimer,
    submitContent : submitContent,
    setNewWriter : setNewWriter,
    exitGroup : exitGroup,
    joinGroup : joinGroup,
    setVoteTimer : setVoteTimer,
    createVote : createVote,
    quitForever : quitForever
}