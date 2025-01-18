const words = [
  'mcha', 'klb', 'ktab',
  'dar', 'bab', 'tomobil', 'magana', 'khbza',
  'chl7', 'atay', 'djaja', '9hwa', 'chklata',
  'stylo', 'koursi','tabla', 'telephone', 'kar',
  'taxi', 'tobis', 'tiyara', 'serwal', 'jlaba',
  'berrad', 'lmehdawi', 'lmalki' , 'kick' , 'banana', 
  'kora' , 'ghaba'  , 'pomada sefra' , 'hatba' , 'ndader',
  'cheb larbi' , 'weld chinwiya' , 'gr3a' , 'lb7er' , 'sa7ib nas',
  'riquelme' , 'madara' , 'loubna' , 'l9niya' , 'trump' , 'm6' , 'iphone',
  'papaghiyo' , 'ghlid', 'hindi', 'mr kbida', 'tunssi' , 'franchien' , 'tour eiffel',
  'baguetta' , 'pc' , 'lawla dorof' , 'couscous' , 'kanissa' , 'jam3' , 'motor' , 'pikala' , 
  'hakimi' , 'regragui' , 'twitter', 'lmoprhine', 'pause flow', 'meskouta' , 'nike', 'dacia',
  'm3za', 'pc gamer' , 'issam siraj din' , 'free fire', 'merendina' , 'timssa7' , 'bn nsns' ,
  'piscine' , 'misstara' , 'chbakiya' , 'mp3', '7rira' , 'erramdani' , 'tfa7a' ,'chouf tv' , '2m',
  'not very funny' , 'klb tayakl f7lwa' , 'farouk life' , '3lal l9adous', '3zi' , 'dz' , 'chinwi' ,'anime',
  '9rd' , 'streamer' , 'monada', 'vodka' , 'jack daniel', 'ma7ya' , 'camel' , '7chich' , '9azam' , 'merda' , '3skri', 'among us' ,'charf',
  'mi na3ima' , 'aya star'
];

const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

module.exports = { getRandomWord };