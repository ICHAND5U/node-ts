/**
 * GET -> Index Page
 *
 * @param Object - request (Containing information about the HTTP request)
 * @param / @return  Type <?> - response (Send back the desired HTTP response)
 */
exports.index = (request, response) => {
    response.send({'status': 'Server Is Running!', 'statusCode': 200})
};
