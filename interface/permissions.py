from rest_framework import permissions


class DevicePermission(permissions.BasePermission):
    message = 'You must own the device to have access'

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user in obj.users.all():
            return True
        else:
            return False
