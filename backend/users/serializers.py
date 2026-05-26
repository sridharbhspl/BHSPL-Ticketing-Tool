from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(max_length=255, required=False)
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role', 'avatar')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD  # Uses 'email' as defined in User model
    
    def validate(self, attrs):
        try:
            # Authenticate using email and password
            user = authenticate(username=attrs['email'], password=attrs['password'])
            
            if not user:
                raise serializers.ValidationError({
                    'detail': 'Invalid email or password. Please try again.'
                })
            
            data = super().validate(attrs)
            data['user'] = UserSerializer(self.user).data # type: ignore
            return data
        except serializers.ValidationError:
            raise
        except Exception as e:
            raise serializers.ValidationError({
                'detail': f'Authentication failed: {str(e)}'
            })

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        default='Developer',
        required=False
    )
    avatar = serializers.CharField(
        required=False,
        allow_blank=True,
        default=''
    )

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'role', 'avatar')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'Developer'),
            avatar=validated_data.get('avatar', '')
        )
        return user
