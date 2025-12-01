import { useState } from 'react';
import PhototicketCanvas from '@/components/PhototicketCanvas';
import { cropImage } from '@/utils/imageCrop';
import { downloadCanvasAsJPEG } from '@/utils/canvasExport';
import { THEATER_CHAINS, SCREENING_FORMATS } from '@/utils/constants';

export default function Home() {
  // 상태 관리
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [watchDate, setWatchDate] = useState('');
  const [theater, setTheater] = useState('');
  const [chain, setChain] = useState('');
  const [format, setFormat] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const cropped = await cropImage(file);
      setCroppedImageUrl(cropped);
    } catch (error) {
      console.error('크롭 실패:', error);
      alert('이미지 처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 다운로드 핸들러
  const handleDownload = () => {
    if (!window.phototicketCanvas) {
      alert('먼저 이미지를 업로드하세요');
      return;
    }

    const filename = `phototicket_${movieTitle || 'untitled'}.jpg`;
    downloadCanvasAsJPEG(window.phototicketCanvas, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">🎬 포토티켓 메이커</h1>
          <p className="text-gray-600 mt-2">
            영화 포스터를 업로드하고 정보를 입력하면 CGV 포토플레이용 포토티켓을 생성합니다
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 입력 폼 */}
          <div className="space-y-6">
            {/* 1. 이미지 업로드 */}
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">1. 포스터 업로드</h2>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageUpload}
                disabled={isProcessing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {isProcessing && (
                <p className="text-sm text-blue-600 mt-2">이미지 처리 중...</p>
              )}
            </section>

            {/* 2. 영화 정보 */}
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">2. 영화 정보</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="movieTitle" className="block text-sm font-medium mb-1">
                    영화 제목
                  </label>
                  <input
                    id="movieTitle"
                    type="text"
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    placeholder="인터스텔라"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="watchDate" className="block text-sm font-medium mb-1">
                    관람일
                  </label>
                  <input
                    id="watchDate"
                    type="text"
                    value={watchDate}
                    onChange={(e) => setWatchDate(e.target.value)}
                    placeholder="2024. 11. 28."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="theater" className="block text-sm font-medium mb-1">
                    극장 위치
                  </label>
                  <input
                    id="theater"
                    type="text"
                    value={theater}
                    onChange={(e) => setTheater(e.target.value)}
                    placeholder="CGV 용산아이파크몰"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* 3. 컴포넌트 선택 */}
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">3. 컴포넌트 선택</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="chain" className="block text-sm font-medium mb-1">
                    극장 체인
                  </label>
                  <select
                    id="chain"
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {THEATER_CHAINS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="format" className="block text-sm font-medium mb-1">
                    상영 포맷
                  </label>
                  <select
                    id="format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SCREENING_FORMATS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 4. 다운로드 */}
            <button
              onClick={handleDownload}
              disabled={!croppedImageUrl}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ⬇️ JPEG 다운로드 (960×1477px)
            </button>
          </div>

          {/* 오른쪽: 프리뷰 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">미리보기</h2>
            {croppedImageUrl ? (
              <PhototicketCanvas
                croppedImageUrl={croppedImageUrl}
                movieTitle={movieTitle}
                watchDate={watchDate}
                theater={theater}
                chain={chain}
                format={format}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded">
                <p className="text-gray-400 text-center">
                  이미지를 업로드하면<br />여기에 표시됩니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
