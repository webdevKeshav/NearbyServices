exports.success = (res, data = {}, statusCode = 200) => {
  res.status(statusCode).json({ success: true, ...data })
}

exports.error = (res, message = 'Server error', statusCode = 500) => {
  res.status(statusCode).json({ success: false, message })
}

exports.paginated = (res, { data, key, total, page, limit }) => {
  res.status(200).json({
    success:     true,
    [key]:       data,
    total,
    currentPage: Number(page),
    totalPages:  Math.ceil(total / Number(limit)),
    count:       data.length,
  })
}
