from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'status': 'success',
            'message': 'Account created successfully. Please log in.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    """Endpoint to manage all users (list, retrieve, create, update, delete)"""
    queryset = User.objects.all().order_by('name')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return RegisterSerializer
        return UserSerializer

from rest_framework.views import APIView

class SeedTestUsersView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        test_users = [
            {"email": "admin@bhspl.in", "name": "Bavya Admin", "role": "Admin"},
            {"email": "projectmanager@bhspl.in", "name": "Bavya Project Manager", "role": "Project Manager"},
            {"email": "seniordeveloper@bhspl.in", "name": "Bavya Senior Developer", "role": "Senior Developer"},
            {"email": "fullstackdeveloper@bhspl.in", "name": "Bavya Fullstack Developer", "role": "Fullstack Developer"},
            {"email": "developer@bhspl.in", "name": "Bavya Developer", "role": "Developer"},
            {"email": "qatester@bhspl.in", "name": "Bavya QA Tester", "role": "QA Tester"},
            {"email": "client@bhspl.in", "name": "Bavya Client", "role": "Client"},
            {"email": "viewer@bhspl.in", "name": "Bavya Viewer", "role": "Viewer"}
        ]
        password = "test@123"
        results = []
        for user_info in test_users:
            email = user_info["email"]
            name = user_info["name"]
            role = user_info["role"]
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "name": name,
                    "role": role,
                    "username": email
                }
            )
            user.set_password(password)
            user.name = name
            user.role = role
            user.save()
            results.append({
                "email": email,
                "role": role,
                "status": "Created" if created else "Updated"
            })
        return Response({
            "status": "success",
            "message": "Role-wise test users seeded successfully in db",
            "users": results
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    Authenticated endpoint to change own password.
    Requires current_password, new_password, confirm_password.
    Industry rule: enforce minimum strength + confirm match.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        current_password  = request.data.get('current_password', '')
        new_password      = request.data.get('new_password', '')
        confirm_password  = request.data.get('confirm_password', '')

        # ── Validate current password ──
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── New password must differ ──
        if current_password == new_password:
            return Response(
                {'error': 'New password must be different from your current password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Confirm password match ──
        if new_password != confirm_password:
            return Response(
                {'error': 'New password and confirmation do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Minimum strength: 8 chars, 1 uppercase, 1 digit ──
        import re
        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not re.search(r'[A-Z]', new_password):
            return Response(
                {'error': 'Password must contain at least one uppercase letter.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not re.search(r'\d', new_password):
            return Response(
                {'error': 'Password must contain at least one number.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password changed successfully. Please log in again.'},
            status=status.HTTP_200_OK
        )

