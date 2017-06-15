
/*
 * GET home page.
 */

exports.indexAcolhimento = function(req, res){
  res.render('index-acolhimento.html', { title: 'Acolhimento - HomePage' });
};

exports.indexTriagem = function(req,res){
  res.render('index-triagem.html', { title: 'Triagem - HomePage'});
}
