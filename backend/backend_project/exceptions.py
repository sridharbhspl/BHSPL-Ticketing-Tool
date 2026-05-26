from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Industry Standard Custom Exception Handler.
    Ensures all API errors follow a consistent structure:
    {
        "status": "error",
        "message": "Human readable message",
        "errors": { ... field specific errors ... },
        "code": "error_code"
    }
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "status": "error",
            "message": "An error occurred while processing your request.",
            "errors": response.data,
            "code": getattr(exc, 'default_code', 'error')
        }

        # If the error is a validation error, provide a clearer message
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            custom_data["message"] = "Validation failed. Please check your input."
        
        # If detail is present in response.data, use it as the message
        if isinstance(response.data, dict) and 'detail' in response.data:
            custom_data["message"] = response.data.get('detail')
            del response.data['detail']

        response.data = custom_data

    return response
