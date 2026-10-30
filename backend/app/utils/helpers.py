from flask import jsonify
from datetime import date, datetime


def api_response(success=True, message="", data=None, errors=None, status_code=200):
    """
    Standard JSON response format for the HEMORA API:
    {
        "success": bool,
        "message": str,
        "data": any,
        "errors": list
    }
    """
    response_body = {
        "success": success,
        "message": message,
        "data": data,
        "errors": errors if errors is not None else []
    }
    return jsonify(response_body), status_code


def success_response(data=None, message="Success", status_code=200):
    """Convenience helper for successful responses."""
    return api_response(success=True, message=message, data=data, errors=[], status_code=status_code)


def error_response(message="An error occurred", errors=None, status_code=400):
    """Convenience helper for error responses."""
    if errors is None:
        errors = [message]
    elif isinstance(errors, str):
        errors = [errors]
    return api_response(success=False, message=message, data=None, errors=errors, status_code=status_code)


def paginate_query(query, page=1, per_page=10, max_per_page=100, serializer=None):
    """
    Helper function to paginate SQLAlchemy queries and format the result.
    """
    try:
        page = max(1, int(page))
    except (TypeError, ValueError):
        page = 1

    try:
        per_page = min(max_per_page, max(1, int(per_page)))
    except (TypeError, ValueError):
        per_page = 10

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    items = pagination.items
    if serializer:
        items = [serializer(item) for item in items]
    elif hasattr(items[0] if items else None, 'to_dict'):
        items = [item.to_dict() for item in items]

    return {
        "items": items,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }


def format_date(d):
    """Format date to ISO string YYYY-MM-DD."""
    if isinstance(d, (date, datetime)):
        return d.strftime("%Y-%m-%d")
    return d


def format_datetime(dt):
    """Format datetime to ISO string."""
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt
