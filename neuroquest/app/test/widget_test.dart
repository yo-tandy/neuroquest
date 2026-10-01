import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:neuroquest/main.dart';
import 'package:webview_flutter_platform_interface/webview_flutter_platform_interface.dart';

/// Minimal in-memory WebView platform so the shell can be built under test.
class _FakeWebViewPlatform extends WebViewPlatform {
  @override
  PlatformWebViewController createPlatformWebViewController(
          PlatformWebViewControllerCreationParams params) =>
      _FakeController(params);

  @override
  PlatformWebViewWidget createPlatformWebViewWidget(
          PlatformWebViewWidgetCreationParams params) =>
      _FakeWidget(params);

  @override
  PlatformNavigationDelegate createPlatformNavigationDelegate(
          PlatformNavigationDelegateCreationParams params) =>
      _FakeNavigationDelegate(params);
}

class _FakeController extends PlatformWebViewController {
  _FakeController(super.params) : super.implementation();
  String? loadedAsset;

  @override
  Future<void> setJavaScriptMode(JavaScriptMode mode) async {}
  @override
  Future<void> setBackgroundColor(Color color) async {}
  @override
  Future<void> setPlatformNavigationDelegate(
      PlatformNavigationDelegate handler) async {}
  @override
  Future<void> loadFlutterAsset(String key) async => loadedAsset = key;
  @override
  Future<Object> runJavaScriptReturningResult(String javaScript) async =>
      false;
}

class _FakeWidget extends PlatformWebViewWidget {
  _FakeWidget(super.params) : super.implementation();
  @override
  Widget build(BuildContext context) => const SizedBox.expand();
}

class _FakeNavigationDelegate extends PlatformNavigationDelegate {
  _FakeNavigationDelegate(super.params) : super.implementation();
  @override
  Future<void> setOnPageFinished(PageEventCallback onPageFinished) async {}
  @override
  Future<void> setOnNavigationRequest(
      NavigationRequestCallback onNavigationRequest) async {}
}

void main() {
  setUp(() => WebViewPlatform.instance = _FakeWebViewPlatform());

  testWidgets('app shell builds and loads the bundled game',
      (WidgetTester tester) async {
    await tester.pumpWidget(const NeuroQuestApp());
    expect(find.byType(GameShell), findsOneWidget);
    // The game is loaded from the app bundle, never from the network.
    final state = tester.state(find.byType(GameShell)) as dynamic;
    final controller = state.controllerForTest.platform as _FakeController;
    expect(controller.loadedAsset, 'assets/web/index.html');
  });

  test('Android back on the win modal returns to the map, not CONTINUE', () {
    // #w-map is "BACK TO MAP"; #w-next would open the next level.
    expect(kBackScript, contains("['modal-win', '#w-map']"));
    expect(kBackScript, isNot(contains('w-next')));
    // No generic "first button in the open modal" fallback.
    expect(kBackScript, isNot(contains('.modal-back:not(.hidden) .btn')));
  });

  test('Android back script behaves per screen when run against a stub DOM',
      () async {
    // Executes kBackScript in Node (test/back_script_test.mjs); skipped
    // where Node isn't installed.
    final ProcessResult r;
    try {
      r = await Process.run('node', ['test/back_script_test.mjs']);
    } on ProcessException {
      markTestSkipped('node not installed');
      return;
    }
    expect(r.exitCode, 0, reason: '${r.stdout}${r.stderr}');
  });
}
