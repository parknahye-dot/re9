# 1단계: Nginx 기반 이미지 사용
FROM nginx:stable-alpine

# 2단계: dist 빌드 결과물을 nginx 기본 경로로 복사
COPY dist/ /usr/share/nginx/html

# 3단계: 커스텀 nginx 설정이 있다면 교체
# (옵션) 로컬 nginx.conf 파일이 있다면 복사
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf


# 4단계: Nginx는 기본적으로 80 포트 사용
EXPOSE 80

# 5단계: 컨테이너 실행 시 nginx 실행
CMD ["nginx", "-g", "daemon off;"]
