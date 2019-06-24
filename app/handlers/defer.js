var q;

function defer()
{
    var res, rej;

    var promise =  new Promise(function(resolve, reject) {
        res = resolve;
        rej = reject;
    });

    promise.resolve = res;
    promise.reject = rej;

    return promise;
}

module.exports = function()
{
    q = defer();
    return q;
};

module.exports.reject = function()
{
    if(typeof q !== 'undefined')
    {
        q.reject();
    }
    else
    {
        console.log('No promise has been created');
    }
};

module.exports.resolve = function()
{
    if(typeof q !== 'undefined')
    {
        q.resolve();
    }
    else
    {
        console.log('No promise has been created');
    }
};
