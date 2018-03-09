from django.views.generic import TemplateView

# Create your views here.
class HomeView(TemplateView):
	template_name = 'home.html'

class DeviceListView(TemplateView):
	template_name = 'dashboard/devices.html'

class DeviceRetrieveView(TemplateView):
	template_name = 'dashboard/device.html'

class LogListView(TemplateView):
	template_name = 'dashboard/logs.html'

class ChartListView(TemplateView):
	template_name = 'dashboard/charts.html'