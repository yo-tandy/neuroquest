import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:webview_flutter/webview_flutter.dart';

// The game's dark board-edge green: status bar, splash and letterboxing.
const _kEdge = Color(0xFF071710);
const _kStatusBar = Color(0xFF0A3D25);

void main() {
  final binding = WidgetsFlutterBinding.ensureInitialized();
  // Keep the native splash up until the WebView has painted the game.
  FlutterNativeSplash.preserve(widgetsBinding: binding);
  // Portrait-only — it's a phone game.
  SystemChrome.setPreferredOrientations(
      [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: _kStatusBar,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
  ));
  runApp(const NeuroQuestApp());
}

class NeuroQuestApp extends StatelessWidget {
  const NeuroQuestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'NeuroQuest',
      debugShowCheckedModeBanner: false,
      home: GameShell(),
    );
  }
}

class GameShell extends StatefulWidget {
  const GameShell({super.key});

  @override
  State<GameShell> createState() => _GameShellState();
}

class _GameShellState extends State<GameShell> {
  late final WebViewController _controller;
  bool _ready = false;

  @visibleForTesting
  WebViewController get controllerForTest => _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(_kEdge)
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) {
          setState(() => _ready = true);
          FlutterNativeSplash.remove();
        },
        // The whole game ships inside the app; never leave it for the web.
        onNavigationRequest: (req) => req.url.startsWith('file://')
            ? NavigationDecision.navigate
            : NavigationDecision.prevent,
      ))
      // The whole game ships inside the app — no server, works offline.
      ..loadFlutterAsset('assets/web/index.html');
  }

  /// Android back button: step out of a level or a modal instead of quitting
  /// the app. Returns true when the game consumed the gesture.
  Future<bool> _handleBack() async {
    try {
      final r = await _controller.runJavaScriptReturningResult('''
        (function () {
          var open = function (id) {
            var el = document.getElementById(id);
            return el && !el.classList.contains('hidden');
          };
          if (open('modal-goal') || open('modal-win') || open('modal-datasheet')) {
            var btn = document.querySelector('.modal-back:not(.hidden) .btn');
            if (btn) { btn.click(); return true; }
          }
          if (open('scr-level') && window.NQ) { NQ.backToMap(); return true; }
          if (open('scr-awards')) {
            var tab = document.querySelector('#scr-awards .tab[data-nav="map"]');
            if (tab) { tab.click(); return true; }
          }
          return false;
        })()''');
      return r == true || r == 'true';
    } catch (_) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final consumed = await _handleBack();
        if (!consumed && mounted) SystemNavigator.pop();
      },
      child: Scaffold(
        backgroundColor: _kEdge,
        body: SafeArea(
          child: Stack(children: [
            WebViewWidget(controller: _controller),
            if (!_ready)
              const Center(
                child: CircularProgressIndicator(color: Color(0xFFE9B94F)),
              ),
          ]),
        ),
      ),
    );
  }
}
