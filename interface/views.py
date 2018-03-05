from django.views.generic import TemplateView

# Create your views here.
class HomeView(TemplateView):
	template_name = 'home.html'

class DeviceListView(TemplateView):
	template_name = 'dashboard/devices.html'

class DeviceRetrieveView(TemplateView):
	template_name = 'dashboard/device.html'