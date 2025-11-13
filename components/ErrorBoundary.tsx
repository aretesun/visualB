import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary 컴포넌트
 *
 * React 컴포넌트 트리에서 발생하는 JavaScript 에러를 캐치하고,
 * 에러를 로깅하며, 폴백 UI를 보여줍니다.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallbackUI />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 다음 렌더링에서 폴백 UI를 보여주도록 상태를 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 서비스에 에러를 기록
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: 프로덕션에서는 에러 로깅 서비스로 전송
    // 예: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">앗! 문제가 발생했습니다</h1>
                <p className="text-gray-600 mt-1">애플리케이션에서 예상치 못한 오류가 발생했습니다.</p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h2 className="font-semibold text-red-800 mb-2">에러 정보:</h2>
                <p className="text-red-700 text-sm font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-gray-600">
                  상세 스택 트레이스 (개발 모드)
                </summary>
                <pre className="mt-3 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                홈으로 돌아가기
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              문제가 계속되면 브라우저 캐시를 지우거나 페이지를 새로고침해보세요.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
